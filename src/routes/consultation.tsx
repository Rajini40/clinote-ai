import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Mic, MicOff, Play, Pause, Sparkles, Loader2, User, Phone, Stethoscope, Building2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/consultation")({
  head: () => ({ meta: [{ title: "New Consultation — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: NewConsultation,
});

const langs = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
];

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-16 items-center justify-center gap-1">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full"
          style={{ background: "var(--gradient-primary)" }}
          animate={{ height: active ? [8, 24 + (i % 5) * 8, 8] : 6 }}
          transition={{ duration: 0.8 + (i % 6) * 0.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function NewConsultation() {
  const [lang, setLang] = useState("en");
  const [recording, setRecording] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const generate = () => {
    setGenerating(true);
    setTimeout(() => navigate({ to: "/soap" }), 1600);
  };

  return (
    <AppShell title="New Consultation" subtitle="Capture the encounter — MediScribe handles the note.">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient info */}
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><User className="h-4 w-4" style={{ color: "var(--neon)" }} />Patient information</h3>
          <div className="mt-5 space-y-4">
            <div className="space-y-2"><Label>Patient name</Label><Input placeholder="e.g. Ravi Kumar" defaultValue="Ravi Kumar" className="h-10 rounded-xl bg-card/60" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Age</Label><Input type="number" defaultValue={54} className="h-10 rounded-xl bg-card/60" /></div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select defaultValue="m">
                  <SelectTrigger className="h-10 rounded-xl bg-card/60"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="m">Male</SelectItem><SelectItem value="f">Female</SelectItem><SelectItem value="o">Other</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="relative"><Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="+91 98765 43210" className="h-10 rounded-xl bg-card/60 pl-10" /></div>
            </div>
            <div className="space-y-2">
              <Label>Doctor</Label>
              <div className="relative"><Stethoscope className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="Dr. Ananya Rao" className="h-10 rounded-xl bg-card/60 pl-10" /></div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <div className="relative"><Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="Internal Medicine" className="h-10 rounded-xl bg-card/60 pl-10" /></div>
            </div>
          </div>
        </div>

        {/* Audio capture */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold">Language</h3>
            <p className="text-xs text-muted-foreground">Select the consultation language</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {langs.map((l) => {
                const active = lang === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                      active ? "border-transparent" : "border-white/10 hover:border-white/20"
                    }`}
                    style={active ? { background: "linear-gradient(135deg, oklch(0.85 0.18 220 / 20%), oklch(0.7 0.22 300 / 15%))", boxShadow: "0 0 24px oklch(0.85 0.18 220 / 25%)" } : { background: "color-mix(in oklab, var(--card) 60%, transparent)" }}
                  >
                    <div className="text-xl">{l.flag}</div>
                    <div className="mt-2 font-semibold">{l.name}</div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-widest">{l.code.toUpperCase()}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recording */}
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-sm font-semibold">Record consultation</h3>
            <p className="text-xs text-muted-foreground">Tap the microphone to begin real-time transcription.</p>

            <div className="mt-6 flex flex-col items-center gap-4">
              <motion.button
                onClick={() => setRecording((r) => !r)}
                whileTap={{ scale: 0.95 }}
                className={`relative grid h-24 w-24 place-items-center rounded-full ${recording ? "animate-pulse-glow" : ""}`}
                style={{ background: "var(--gradient-primary)" }}
              >
                {recording ? <MicOff className="h-9 w-9 text-primary-foreground" /> : <Mic className="h-9 w-9 text-primary-foreground" />}
                {recording && <span className="absolute -inset-2 rounded-full border border-white/20" />}
              </motion.button>
              <div className="text-center">
                <div className="text-sm font-semibold">{recording ? "Recording…" : "Idle"}</div>
                <div className="text-xs text-muted-foreground">{recording ? "00:42 · Auto-detecting speakers" : "Press to start"}</div>
              </div>
              <div className="w-full max-w-xl rounded-xl border border-white/5 bg-card/40 p-3">
                <Waveform active={recording} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-card/60"><Play className="mr-1.5 h-3.5 w-3.5" /> Play</Button>
                <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-card/60"><Pause className="mr-1.5 h-3.5 w-3.5" /> Pause</Button>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
            className={`glass rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-[color:var(--neon)] bg-white/5" : "border-white/10"}`}
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl glass" style={{ boxShadow: "0 0 24px oklch(0.85 0.18 220 / 30%)" }}>
              <UploadCloud className="h-5 w-5" style={{ color: "var(--neon)" }} />
            </div>
            <div className="mt-4 text-sm font-semibold">Drop audio here, or click to upload</div>
            <div className="mt-1 text-xs text-muted-foreground">MP3, WAV, M4A — up to 25 MB · 60 min</div>
            <Button variant="outline" className="mt-4 rounded-xl border-white/10 bg-card/60">Choose file</Button>
          </div>

          {/* Generate */}
          <Button
            onClick={generate}
            disabled={generating}
            size="lg"
            className="h-14 w-full rounded-2xl text-base text-primary-foreground hover-lift"
            style={{ background: "var(--gradient-primary)" }}
          >
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating SOAP note…
                </motion.span>
              ) : (
                <motion.span key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" /> Generate SOAP Note
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
