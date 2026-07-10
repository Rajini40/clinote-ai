import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Download, FileText, Save, Pencil, Printer, Share2, AlertTriangle,
  Pill, CalendarClock, ClipboardList, Activity, Brain, Notebook,
} from "lucide-react";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/soap")({
  head: () => ({ meta: [{ title: "SOAP Note — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: SoapNote,
});

const sections = [
  {
    key: "S", title: "Subjective", icon: Notebook, color: "var(--neon)",
    body: [
      "54-year-old male presents with intermittent chest tightness for 2 weeks, worse on exertion.",
      "Denies radiation to arm/jaw, no diaphoresis. Reports mild orthopnea over last 5 days.",
      "PMH: HTN (10 yrs, on amlodipine 5 mg). Non-smoker. Father: MI at 62.",
    ],
  },
  {
    key: "O", title: "Objective", icon: Activity, color: "var(--cyan)",
    body: [
      "BP 152/94 mmHg · HR 88 · RR 18 · SpO₂ 97% · Temp 98.4°F",
      "Cardio: S1/S2 normal, no murmurs. Lungs clear bilaterally. No pedal edema.",
      "ECG: normal sinus rhythm, no acute ST changes.",
    ],
  },
  {
    key: "A", title: "Assessment", icon: Brain, color: "var(--violet)",
    body: [
      "Uncontrolled essential hypertension (Stage 2) with atypical chest pain — low-to-intermediate risk.",
      "Rule out stable angina — stress test indicated.",
    ],
  },
  {
    key: "P", title: "Plan", icon: ClipboardList, color: "var(--emerald)",
    body: [
      "Increase amlodipine to 10 mg OD; add losartan 25 mg OD.",
      "Order lipid panel, HbA1c, ECHO, and treadmill stress test.",
      "Lifestyle: DASH diet, 30 min walk × 5/week, reduce sodium.",
    ],
  },
];

const meds = [
  { name: "Amlodipine", dose: "10 mg", freq: "OD", route: "PO" },
  { name: "Losartan", dose: "25 mg", freq: "OD", route: "PO" },
  { name: "Atorvastatin", dose: "20 mg", freq: "HS", route: "PO" },
];

function SoapNote() {
  return (
    <AppShell title="SOAP Note · Ravi Kumar" subtitle="Generated in 42 seconds · Telugu → English translation · 99.2% confidence">
      {/* Toolbar */}
      <div className="glass mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Badge className="border-0 bg-emerald-400/15 text-[color:var(--emerald)]">AI generated</Badge>
          <Badge variant="outline" className="border-white/10 bg-card/60">Confidence 99.2%</Badge>
          <Badge variant="outline" className="border-white/10 bg-card/60">Language: Telugu</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-card/60"><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-card/60"><Save className="mr-1.5 h-3.5 w-3.5" /> Save</Button>
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-card/60"><Printer className="mr-1.5 h-3.5 w-3.5" /> Print</Button>
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-card/60"><Share2 className="mr-1.5 h-3.5 w-3.5" /> Share</Button>
          <Button size="sm" className="rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Download className="mr-1.5 h-3.5 w-3.5" /> PDF</Button>
          <Button size="sm" variant="secondary" className="rounded-xl"><FileText className="mr-1.5 h-3.5 w-3.5" /> DOCX</Button>
        </div>
      </div>

      {/* Critical alert */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass mb-6 flex items-start gap-4 overflow-hidden rounded-2xl border border-rose-500/20 p-5" style={{ background: "linear-gradient(135deg, oklch(0.65 0.24 20 / 12%), transparent)" }}>
        <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "oklch(0.65 0.24 20 / 20%)" }}>
          <AlertTriangle className="h-5 w-5" style={{ color: "var(--danger)" }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Critical alert · BP Stage 2</div>
          <p className="text-xs text-muted-foreground">Systolic 152 mmHg with atypical chest pain. Recommend expedited cardiology review and stress testing.</p>
        </div>
        <Badge className="border-0 bg-rose-500/20 text-[color:var(--danger)]">High</Badge>
      </motion.div>

      {/* SOAP grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s, i) => (
          <motion.section
            key={s.key}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass hover-lift relative overflow-hidden rounded-2xl p-6"
          >
            <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: s.color }} />
            <div className="relative flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl glass" style={{ boxShadow: `0 0 24px ${s.color}55` }}>
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{s.key}</div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
              </div>
            </div>
            <ul className="relative mt-5 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {s.body.map((b) => (<li key={b} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: s.color }} />{b}</li>))}
            </ul>
          </motion.section>
        ))}
      </div>

      {/* Meds + follow-up + summary */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl glass"><Pill className="h-4 w-4" style={{ color: "var(--neon)" }} /></div><h3 className="font-semibold">Medication</h3></div>
          <ul className="mt-4 space-y-2 text-sm">
            {meds.map((m) => (
              <li key={m.name} className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 px-3 py-2">
                <div><div className="font-medium">{m.name}</div><div className="text-[11px] text-muted-foreground">{m.route} · {m.freq}</div></div>
                <Badge variant="outline" className="border-white/10 bg-card/60">{m.dose}</Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl glass"><CalendarClock className="h-4 w-4" style={{ color: "var(--emerald)" }} /></div><h3 className="font-semibold">Follow-up</h3></div>
          <div className="mt-4 rounded-xl border border-white/5 bg-card/40 p-4 text-sm">
            <div className="text-muted-foreground">Next visit</div>
            <div className="mt-1 font-semibold">In 2 weeks · 24 Nov 2026</div>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              <li>· BP diary (AM/PM)</li>
              <li>· Bring stress test results</li>
              <li>· Report if chest pain returns</li>
            </ul>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl glass"><FileText className="h-4 w-4" style={{ color: "var(--violet)" }} /></div><h3 className="font-semibold">Summary</h3></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Uncontrolled hypertension with atypical chest pain. Antihypertensive intensified,
            statin initiated, and non-invasive cardiac workup scheduled. Patient counseled on
            lifestyle and red-flag symptoms; follow-up in 2 weeks.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
