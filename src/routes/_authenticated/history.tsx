import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Badge } from "@/components/ui/badge";
import { FileText, Mic, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: History,
});

const events = [
  { t: "10:42 AM", title: "SOAP note generated", who: "Ravi Kumar · Telugu", type: "note", icon: FileText, color: "var(--neon)" },
  { t: "10:38 AM", title: "Consultation recorded", who: "Ravi Kumar · 6 min 12s", type: "rec", icon: Mic, color: "var(--cyan)" },
  { t: "09:55 AM", title: "Critical alert flagged", who: "Farhan Ali · Asthma", type: "alert", icon: AlertTriangle, color: "var(--danger)" },
  { t: "09:40 AM", title: "SOAP note generated", who: "Meera Shah · English", type: "note", icon: FileText, color: "var(--violet)" },
  { t: "09:20 AM", title: "Consultation recorded", who: "Meera Shah · 4 min 03s", type: "rec", icon: Mic, color: "var(--emerald)" },
  { t: "Yesterday", title: "SOAP note generated", who: "Arjun Patel · Hindi", type: "note", icon: FileText, color: "var(--neon)" },
];

function History() {
  return (
    <AppShell title="Activity History" subtitle="Every consultation and note across your practice.">
      <div className="glass rounded-2xl p-6">
        <div className="relative pl-6">
          <div className="absolute bottom-0 left-2 top-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
          <div className="space-y-6">
            {events.map((e) => (
              <div key={e.t + e.title} className="relative">
                <div className="absolute -left-[26px] top-1 grid h-8 w-8 place-items-center rounded-xl glass" style={{ boxShadow: `0 0 20px ${e.color}55` }}>
                  <e.icon className="h-3.5 w-3.5" style={{ color: e.color }} />
                </div>
                <div className="glass ml-2 flex flex-wrap items-center justify-between gap-2 rounded-xl p-4">
                  <div>
                    <div className="text-sm font-semibold">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.who}</div>
                  </div>
                  <Badge variant="outline" className="border-white/10 bg-card/60 text-[10px]">{e.t}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
