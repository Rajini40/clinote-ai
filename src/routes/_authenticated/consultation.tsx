import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Mic, MicOff, Sparkles, Loader2, User, Phone, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { createConsultation, updateConsultation } from "@/lib/consultations.functions";
import { getUploadUrl } from "@/lib/storage.functions";
import { generateSoapFromConsultation } from "@/lib/soap.functions";
import { listPatients } from "@/lib/patients.functions";
import { createNotification } from "@/lib/notifications.functions";

export const Route = createFileRoute("/_authenticated/consultation")({
  head: () => ({ meta: [{ title: "New Consultation — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: NewConsultation,
});

const langs = [
  { code: "English", flag: "🇬🇧" },
  { code: "Telugu", flag: "🇮🇳" },
  { code: "Hindi", flag: "🇮🇳" },
  { code: "Tamil", flag: "🇮🇳" },
  { code: "Kannada", flag: "🇮🇳" },
];

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-16 items-center justify-center gap-1">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.span key={i} className="w-1 rounded-full" style={{ background: "var(--gradient-primary)" }}
          animate={{ height: active ? [8, 24 + (i % 5) * 8, 8] : 6 }}
          transition={{ duration: 0.8 + (i % 6) * 0.1, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function NewConsultation() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("English");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [generating, setGenerating] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef<number>(0);

  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => listPatients() });

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedRef.current) / 1000)), 500);
    return () => clearInterval(id);
  }, [recording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioName(`recording-${Date.now()}.webm`);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      mediaRef.current = rec;
      startedRef.current = Date.now();
      setSeconds(0);
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) return toast.error("File too large — max 25 MB");
    setAudioBlob(f);
    setAudioName(f.name);
  };

  const uploadIfNeeded = async () => {
    if (!audioBlob || uploadedPath) return uploadedPath;
    const { path, signedUrl, token } = await getUploadUrl({
      data: { bucket: "consultation-audio", filename: audioName ?? "audio.webm" },
    });
    // Use supabase client for signed upload (handles token header for us)
    const { error } = await supabase.storage
      .from("consultation-audio")
      .uploadToSignedUrl(path, token, audioBlob, {
        contentType: audioBlob.type || "audio/webm",
      });
    if (error) throw new Error(error.message);
    setUploadedPath(path);
    return path;
  };

  const genMut = useMutation({
    mutationFn: async () => {
      if (!patientName.trim()) throw new Error("Enter a patient name");
      // 1. Create consultation immediately as Pending
      const consult = await createConsultation({
        data: {
          patient_id: patientId ?? null,
          patient_name: patientName.trim(),
          language: lang,
          chief_complaint: chiefComplaint || null,
          duration_seconds: seconds,
          status: "Pending",
          audio_path: null,
        },
      });
      // 2. Upload audio (if any) — mark Uploading
      let audioPath: string | null = null;
      if (audioBlob) {
        await updateConsultation({ data: { id: consult.id, status: "Uploading" } });
        try {
          audioPath = await uploadIfNeeded();
          await updateConsultation({ data: { id: consult.id, audio_path: audioPath, status: "Pending" } });
        } catch (err) {
          await updateConsultation({ data: { id: consult.id, status: "Failed" } });
          await createNotification({
            data: {
              type: "upload_failed",
              title: "Audio upload failed",
              message: err instanceof Error ? err.message : "Could not upload the recording.",
              entity: "consultation",
              entity_id: consult.id,
            },
          }).catch(() => undefined);
          throw err;
        }
      }
      // 3. Run AI pipeline (server flips status to Transcribing → Generating SOAP → Completed / Failed)
      try {
        await generateSoapFromConsultation({ data: { consultation_id: consult.id } });
      } catch (err) {
        console.warn("SOAP generation deferred:", err);
      }
      return consult;
    },
    onMutate: () => setGenerating(true),
    onSettled: () => setGenerating(false),
    onSuccess: (consult) => {
      toast.success("Consultation saved");
      navigate({ to: "/soap", search: { id: consult.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <AppShell title="New Consultation" subtitle="Capture the encounter — MediScribe handles the note.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><User className="h-4 w-4" style={{ color: "var(--neon)" }} />Patient information</h3>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label>Existing patient (optional)</Label>
              <Select
                value={patientId ?? "none"}
                onValueChange={(v) => {
                  if (v === "none") { setPatientId(null); return; }
                  setPatientId(v);
                  const p = patients.find((x) => x.id === v);
                  if (p) setPatientName(p.full_name);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl bg-card/60"><SelectValue placeholder="Select a patient…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Walk-in / new —</SelectItem>
                  {patients.map((p) => (<SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Patient name</Label>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g. Ravi Kumar" className="h-10 rounded-xl bg-card/60" />
            </div>
            <div className="space-y-2">
              <Label>Chief complaint</Label>
              <Textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="What brings the patient in today?" className="min-h-[90px] rounded-xl bg-card/60" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold">Language</h3>
            <p className="text-xs text-muted-foreground">Select the consultation language</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {langs.map((l) => {
                const active = lang === l.code;
                return (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${active ? "border-transparent" : "border-white/10 hover:border-white/20"}`}
                    style={active ? { background: "linear-gradient(135deg, oklch(0.85 0.18 220 / 20%), oklch(0.7 0.22 300 / 15%))", boxShadow: "0 0 24px oklch(0.85 0.18 220 / 25%)" } : { background: "color-mix(in oklab, var(--card) 60%, transparent)" }}>
                    <div className="text-xl">{l.flag}</div>
                    <div className="mt-2 text-sm font-semibold">{l.code}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-sm font-semibold">Record consultation</h3>
            <p className="text-xs text-muted-foreground">Records in your browser and uploads securely to your account.</p>

            <div className="mt-6 flex flex-col items-center gap-4">
              <motion.button onClick={() => (recording ? stopRecording() : startRecording())} whileTap={{ scale: 0.95 }}
                className={`relative grid h-24 w-24 place-items-center rounded-full ${recording ? "animate-pulse-glow" : ""}`}
                style={{ background: "var(--gradient-primary)" }}>
                {recording ? <MicOff className="h-9 w-9 text-primary-foreground" /> : <Mic className="h-9 w-9 text-primary-foreground" />}
              </motion.button>
              <div className="text-center">
                <div className="text-sm font-semibold">{recording ? "Recording…" : audioBlob ? "Recorded" : "Idle"}</div>
                <div className="text-xs text-muted-foreground">{mm}:{ss}{audioName ? ` · ${audioName}` : ""}</div>
              </div>
              <div className="w-full max-w-xl rounded-xl border border-white/5 bg-card/40 p-3">
                <Waveform active={recording} />
              </div>
            </div>
          </div>

          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files?.[0] ?? null); }}
            className={`glass block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-[color:var(--neon)] bg-white/5" : "border-white/10"}`}>
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl glass" style={{ boxShadow: "0 0 24px oklch(0.85 0.18 220 / 30%)" }}>
              <UploadCloud className="h-5 w-5" style={{ color: "var(--neon)" }} />
            </div>
            <div className="mt-4 text-sm font-semibold">Drop audio here, or click to upload</div>
            <div className="mt-1 text-xs text-muted-foreground">MP3, WAV, M4A, WEBM — up to 25 MB</div>
          </label>

          <Button onClick={() => genMut.mutate()} disabled={generating || !patientName.trim()} size="lg"
            className="h-14 w-full rounded-2xl text-base text-primary-foreground hover-lift" style={{ background: "var(--gradient-primary)" }}>
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving & generating SOAP…
                </motion.span>
              ) : (
                <motion.span key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" /> Save consultation & generate SOAP
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <FileText className="mr-1 inline h-3 w-3" />
            AI SOAP generation is handled by the FastAPI backend once wired. The consultation is stored either way.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
