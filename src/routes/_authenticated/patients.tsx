import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Eye, Download, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/patients")({
  head: () => ({ meta: [{ title: "Patient Records — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: Patients,
});

const rows = [
  ["Ravi Kumar", "Dr. A. Rao", "12 Nov 2026", "Telugu", "Hypertension", "Completed"],
  ["Meera Shah", "Dr. A. Rao", "12 Nov 2026", "English", "Migraine", "Completed"],
  ["Arjun Patel", "Dr. P. Menon", "12 Nov 2026", "Hindi", "T2 Diabetes", "Review"],
  ["Lakshmi Devi", "Dr. A. Rao", "11 Nov 2026", "Telugu", "URTI", "Completed"],
  ["Farhan Ali", "Dr. R. Iyer", "11 Nov 2026", "Hindi", "Asthma flare", "Alert"],
  ["Sneha Reddy", "Dr. A. Rao", "10 Nov 2026", "Telugu", "Anemia", "Completed"],
  ["Karan Mehta", "Dr. P. Menon", "10 Nov 2026", "English", "GERD", "Completed"],
  ["Divya Nair", "Dr. R. Iyer", "9 Nov 2026", "English", "Thyroid f/u", "Review"],
];

function Patients() {
  return (
    <AppShell title="Patient Records" subtitle="All consultations across your practice.">
      <div className="glass mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by patient, diagnosis, or doctor…" className="h-10 rounded-xl bg-card/60 pl-10" />
        </div>
        <Button variant="outline" className="rounded-xl border-white/10 bg-card/60"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
        <Button className="rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Plus className="mr-2 h-4 w-4" /> New Record</Button>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {["Patient", "Doctor", "Date", "Language", "Diagnosis", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]} className="border-t border-white/5 transition-colors hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="font-medium">{r[0]}</div>
                    <div className="text-[11px] text-muted-foreground">ID · #{Math.floor(Math.random() * 90000) + 10000}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{r[1]}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r[2]}</td>
                  <td className="px-6 py-4"><Badge variant="outline" className="border-white/10 bg-card/60 text-[10px]">{r[3]}</Badge></td>
                  <td className="px-6 py-4">{r[4]}</td>
                  <td className="px-6 py-4">
                    <Badge className={`border-0 text-[10px] ${
                      r[5] === "Alert" ? "bg-rose-400/15 text-[color:var(--danger)]" :
                      r[5] === "Review" ? "bg-amber-400/15 text-amber-300" :
                      "bg-emerald-400/15 text-[color:var(--emerald)]"
                    }`}>{r[5]}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg"><Download className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-[color:var(--danger)]"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-6 py-4 text-xs text-muted-foreground">
          <div>Showing 1–8 of 2,847</div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-white/10 bg-card/60"><ChevronLeft className="h-3.5 w-3.5" /></Button>
            {[1, 2, 3, "…", 128].map((p, i) => (
              <Button key={i} size="sm" variant={p === 1 ? "default" : "outline"} className={`h-8 min-w-8 rounded-lg ${p === 1 ? "text-primary-foreground" : "border-white/10 bg-card/60"}`} style={p === 1 ? { background: "var(--gradient-primary)" } : undefined}>{p}</Button>
            ))}
            <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-white/10 bg-card/60"><ChevronRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
