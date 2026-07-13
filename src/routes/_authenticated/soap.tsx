import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Download, FileText, Save, Pencil, Printer, AlertTriangle, ClipboardList,
  Activity, Brain, Notebook, Loader2, History, RotateCcw, Mic,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getConsultation } from "@/lib/consultations.functions";
import { getSoapByConsultation, saveSoap } from "@/lib/soap.functions";
import { listConsultations } from "@/lib/consultations.functions";
import { generateSoapPdf, getSoapPdfUrl } from "@/lib/pdf.functions";
import {
  getTranscript, saveTranscript, listTranscriptVersions, restoreTranscriptVersion,
} from "@/lib/transcripts.functions";


const searchSchema = z.object({ id: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/soap")({
  head: () => ({ meta: [{ title: "SOAP Note — MediScribe" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: SoapNote,
});

type Fields = { subjective: string; objective: string; assessment: string; plan: string; medication: string; summary: string };
const empty: Fields = { subjective: "", objective: "", assessment: "", plan: "", medication: "", summary: "" };

function SoapNote() {
  const { id } = Route.useSearch();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState<Fields>(empty);
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [transcriptEditing, setTranscriptEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // If no id in URL, pick the most recent consultation.
  const { data: recent } = useQuery({
    queryKey: ["consultations-latest"],
    queryFn: () => listConsultations(),
    enabled: !id,
  });
  const consultId = id ?? recent?.[0]?.id;

  const { data: consult } = useQuery({
    queryKey: ["consultation", consultId],
    queryFn: () => getConsultation({ data: { id: consultId! } }),
    enabled: !!consultId,
  });

  const { data: soap, isLoading } = useQuery({
    queryKey: ["soap", consultId],
    queryFn: () => getSoapByConsultation({ data: { consultation_id: consultId! } }),
    enabled: !!consultId,
  });

  useEffect(() => {
    if (soap) {
      setFields({
        subjective: soap.subjective ?? "",
        objective: soap.objective ?? "",
        assessment: soap.assessment ?? "",
        plan: soap.plan ?? "",
        medication: soap.medication ?? "",
        summary: soap.summary ?? "",
      });
    }
  }, [soap]);

  // ── Transcript ────────────────────────────────────────────────────────────
  const { data: transcriptRow } = useQuery({
    queryKey: ["transcript", consultId],
    queryFn: () => getTranscript({ data: { consultation_id: consultId! } }),
    enabled: !!consultId,
  });
  const { data: versions } = useQuery({
    queryKey: ["transcript-versions", consultId],
    queryFn: () => listTranscriptVersions({ data: { consultation_id: consultId! } }),
    enabled: !!consultId,
  });
  useEffect(() => {
    if (!transcriptEditing) setTranscriptDraft(transcriptRow?.transcript ?? "");
  }, [transcriptRow, transcriptEditing]);

  const saveTranscriptMut = useMutation({
    mutationFn: () => saveTranscript({ data: { consultation_id: consultId!, transcript: transcriptDraft } }),
    onSuccess: (res) => {
      if (res.unchanged) toast.info("No changes to transcript");
      else toast.success(`Transcript saved (v${res.version})`);
      setTranscriptEditing(false);
      qc.invalidateQueries({ queryKey: ["transcript", consultId] });
      qc.invalidateQueries({ queryKey: ["transcript-versions", consultId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save transcript"),
  });

  const restoreMut = useMutation({
    mutationFn: (version_id: string) =>
      restoreTranscriptVersion({ data: { consultation_id: consultId!, version_id } }),
    onSuccess: () => {
      toast.success("Transcript restored");
      qc.invalidateQueries({ queryKey: ["transcript", consultId] });
      qc.invalidateQueries({ queryKey: ["transcript-versions", consultId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to restore"),
  });


  const saveMut = useMutation({
    mutationFn: () => saveSoap({ data: { consultation_id: consultId!, ...fields } }),
    onSuccess: () => {
      toast.success("SOAP note saved");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["soap", consultId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  const pdfMut = useMutation({
    mutationFn: async () => {
      const res = await generateSoapPdf({ data: { consultation_id: consultId! } });
      return res;
    },
    onSuccess: (res) => {
      toast.success("PDF generated");
      window.open(res.url, "_blank", "noopener,noreferrer");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to generate PDF"),
  });

  const printMut = useMutation({
    mutationFn: async () => {
      const existing = await getSoapPdfUrl({ data: { consultation_id: consultId! } });
      if (existing.url) return existing.url;
      const res = await generateSoapPdf({ data: { consultation_id: consultId! } });
      return res.url;
    },
    onSuccess: (url) => {
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (w) {
        w.addEventListener("load", () => {
          try { w.focus(); w.print(); } catch { /* noop */ }
        });
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to open PDF"),
  });

  if (!consultId) {
    return (
      <AppShell title="SOAP Notes" subtitle="No consultation selected.">
        <div className="glass rounded-2xl p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No SOAP notes yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Start a consultation to generate your first SOAP note.</p>
          <Link to="/consultation"><Button className="mt-6 rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>New consultation</Button></Link>
        </div>
      </AppShell>
    );
  }

  const sections: Array<[keyof Fields, string, string, any]> = [
    ["subjective", "S", "Subjective", Notebook],
    ["objective", "O", "Objective", Activity],
    ["assessment", "A", "Assessment", Brain],
    ["plan", "P", "Plan", ClipboardList],
  ];
  const colors = ["var(--neon)", "var(--cyan)", "var(--violet)", "var(--emerald)"];

  return (
    <AppShell
      title={consult ? `SOAP Note · ${consult.patient_name}` : "SOAP Note"}
      subtitle={consult ? `Language: ${consult.language}${consult.diagnosis ? ` · ${consult.diagnosis}` : ""}` : undefined}
    >
      <div className="glass mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Badge className="border-0 bg-emerald-400/15 text-[color:var(--emerald)]">{consult?.status ?? "Draft"}</Badge>
          {consult?.language && <Badge variant="outline" className="border-white/10 bg-card/60">Language: {consult.language}</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editing ? (
            <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
              className="rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              {saveMut.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />} Save
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-xl border-white/10 bg-card/60">
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => printMut.mutate()} disabled={printMut.isPending} className="rounded-xl border-white/10 bg-card/60">
            {printMut.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Printer className="mr-1.5 h-3.5 w-3.5" />} Print
          </Button>
          <Button size="sm" onClick={() => pdfMut.mutate()} disabled={pdfMut.isPending} className="rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            {pdfMut.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />} Download PDF
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="glass mb-6 flex items-center gap-2 rounded-2xl p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading SOAP note…
        </div>
      )}

      {!isLoading && !soap && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="glass mb-6 flex items-start gap-4 rounded-2xl border border-amber-500/20 p-5"
          style={{ background: "linear-gradient(135deg, oklch(0.75 0.18 80 / 12%), transparent)" }}>
          <AlertTriangle className="h-5 w-5" style={{ color: "var(--danger)" }} />
          <div className="flex-1">
            <div className="text-sm font-semibold">SOAP note not yet generated</div>
            <p className="text-xs text-muted-foreground">
              The AI SOAP generation service (FastAPI) will populate this note. You can also edit and save manually.
            </p>
          </div>
          <Button size="sm" onClick={() => setEditing(true)} className="rounded-xl">Start manually</Button>
        </motion.div>
      )}

      <section className="glass mb-6 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl glass" style={{ boxShadow: "0 0 24px oklch(0.85 0.18 220 / 40%)" }}>
              <Mic className="h-4 w-4" style={{ color: "var(--neon)" }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Transcript</div>
              <h3 className="text-lg font-semibold">Consultation transcript</h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {versions && versions.length > 0 && (
              <Badge variant="outline" className="border-white/10 bg-card/60">v{versions[0].version}</Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowHistory((v) => !v)}
              className="rounded-xl border-white/10 bg-card/60">
              <History className="mr-1.5 h-3.5 w-3.5" /> History {versions?.length ? `(${versions.length})` : ""}
            </Button>
            {transcriptEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => { setTranscriptEditing(false); setTranscriptDraft(transcriptRow?.transcript ?? ""); }}
                  className="rounded-xl border-white/10 bg-card/60">Cancel</Button>
                <Button size="sm" onClick={() => saveTranscriptMut.mutate()} disabled={saveTranscriptMut.isPending}
                  className="rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  {saveTranscriptMut.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />} Save
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setTranscriptEditing(true)}
                className="rounded-xl border-white/10 bg-card/60">
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5">
          {transcriptEditing ? (
            <Textarea value={transcriptDraft} onChange={(e) => setTranscriptDraft(e.target.value)}
              className="min-h-[220px] rounded-xl bg-card/60" placeholder="Consultation transcript…" />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {transcriptRow?.transcript || <span className="italic opacity-60">No transcript yet. It will appear once transcription completes.</span>}
            </p>
          )}
        </div>

        {showHistory && (
          <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Version history</div>
            {(!versions || versions.length === 0) ? (
              <p className="text-xs text-muted-foreground italic">No prior versions.</p>
            ) : (
              <ul className="space-y-2">
                {versions.map((v) => (
                  <li key={v.id} className="glass flex items-start justify-between gap-3 rounded-xl p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="border-white/10 bg-card/60">v{v.version}</Badge>
                        <span className="text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span>
                        {v.note && <span className="text-muted-foreground">· {v.note}</span>}
                      </div>
                      <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground/80">
                        {v.transcript || <span className="italic">(empty)</span>}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => restoreMut.mutate(v.id)}
                      disabled={restoreMut.isPending}
                      className="shrink-0 rounded-xl border-white/10 bg-card/60">
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Restore
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>


      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(([key, letter, title, Icon], i) => (
          <motion.section key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass hover-lift relative overflow-hidden rounded-2xl p-6">
            <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: colors[i] }} />
            <div className="relative flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl glass" style={{ boxShadow: `0 0 24px ${colors[i]}55` }}>
                <Icon className="h-4 w-4" style={{ color: colors[i] }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{letter}</div>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
            </div>
            <div className="relative mt-5">
              {editing ? (
                <Textarea value={fields[key]} onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                  className="min-h-[160px] rounded-xl bg-card/60" placeholder={`Enter ${title.toLowerCase()}…`} />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {fields[key] || <span className="italic opacity-60">No {title.toLowerCase()} yet.</span>}
                </p>
              )}
            </div>
          </motion.section>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold">Medication</h3>
          {editing ? (
            <Textarea value={fields.medication} onChange={(e) => setFields({ ...fields, medication: e.target.value })}
              className="mt-3 min-h-[120px] rounded-xl bg-card/60" placeholder="Prescribed medications…" />
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {fields.medication || <span className="italic opacity-60">No medication recorded.</span>}
            </p>
          )}
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold">Summary</h3>
          {editing ? (
            <Textarea value={fields.summary} onChange={(e) => setFields({ ...fields, summary: e.target.value })}
              className="mt-3 min-h-[120px] rounded-xl bg-card/60" placeholder="High-level summary…" />
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {fields.summary || <span className="italic opacity-60">No summary yet.</span>}
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
