import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Eye, Trash2, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { listPatients, createPatient, deletePatient } from "@/lib/patients.functions";

export const Route = createFileRoute("/_authenticated/patients")({
  head: () => ({ meta: [{ title: "Patient Records — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: Patients,
});

function Patients() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", age: "", gender: "", contact: "", medical_history: "" });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => listPatients(),
  });

  const createMut = useMutation({
    mutationFn: (input: typeof form) =>
      createPatient({
        data: {
          full_name: input.full_name,
          age: input.age ? Number(input.age) : null,
          gender: input.gender || null,
          contact: input.contact || null,
          medical_history: input.medical_history || null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient added");
      setOpen(false);
      setForm({ full_name: "", age: "", gender: "", contact: "", medical_history: "" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add patient"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deletePatient({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient removed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to remove"),
  });

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.medical_history ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppShell title="Patient Records" subtitle="Your registered patients.">
      <div className="glass mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by patient or condition…" className="h-10 rounded-xl bg-card/60 pl-10" />
        </div>
        <Button variant="outline" className="rounded-xl border-white/10 bg-card/60"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="mr-2 h-4 w-4" /> New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong sm:max-w-[480px]">
            <DialogHeader><DialogTitle>Add patient</DialogTitle></DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="fn">Full name</Label>
                <Input id="fn" required maxLength={120} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" min={0} max={150} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hist">Medical history</Label>
                <Input id="hist" value={form.medical_history} onChange={(e) => setForm({ ...form, medical_history: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMut.isPending} className="rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  {createMut.isPending ? "Saving…" : "Save patient"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {["Patient", "Age", "Gender", "Contact", "History", "Added", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                  No patients yet. Add your first patient to get started.
                </td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-white/5 transition-colors hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="font-medium">{p.full_name}</div>
                    <div className="text-[11px] text-muted-foreground">ID · #{p.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{p.age ?? "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{p.gender ?? "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{p.contact ?? "—"}</td>
                  <td className="px-6 py-4">{p.medical_history ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <Badge variant="outline" className="border-white/10 bg-card/60 text-[10px]">
                      {new Date(p.created_at).toLocaleDateString()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Eye className="h-4 w-4" /></Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-[color:var(--danger)]"
                        onClick={() => delMut.mutate(p.id)}
                        disabled={delMut.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
