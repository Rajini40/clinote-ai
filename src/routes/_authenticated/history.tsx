import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Badge } from "@/components/ui/badge";
import { FileText, Mic, AlertTriangle, Loader2 } from "lucide-react";
import { listConsultations } from "@/lib/consultations.functions";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: History,
});

function formatWhen(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString();
}

function History() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["consultations"],
    queryFn: () => listConsultations(),
  });

  return (
    <AppShell title="Activity History" subtitle="Every consultation and note across your practice.">
      <div className="glass rounded-2xl p-6">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No activity yet. Start a new consultation to see history here.
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute bottom-0 left-2 top-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
            <div className="space-y-6">
              {events.map((e) => {
                const isAlert = e.status === "Alert";
                const Icon = isAlert ? AlertTriangle : e.diagnosis ? FileText : Mic;
                const color = isAlert ? "var(--danger)" : e.diagnosis ? "var(--neon)" : "var(--cyan)";
                return (
                  <div key={e.id} className="relative">
                    <div className="absolute -left-[26px] top-1 grid h-8 w-8 place-items-center rounded-xl glass" style={{ boxShadow: `0 0 20px ${color}55` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                    </div>
                    <div className="glass ml-2 flex flex-wrap items-center justify-between gap-2 rounded-xl p-4">
                      <div>
                        <div className="text-sm font-semibold">
                          {e.diagnosis ? `SOAP: ${e.diagnosis}` : "Consultation recorded"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {e.patient_name} · {e.language}
                          {e.duration_seconds ? ` · ${Math.round(e.duration_seconds / 60)} min` : ""}
                        </div>
                      </div>
                      <Badge variant="outline" className="border-white/10 bg-card/60 text-[10px]">
                        {formatWhen(e.created_at)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
