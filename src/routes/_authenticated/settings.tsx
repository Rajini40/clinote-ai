import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Bell, Globe, Loader2 } from "lucide-react";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { listLanguages } from "@/lib/languages.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: Settings,
});

function Section({ icon: Icon, title, desc, children }: any) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl glass" style={{ boxShadow: "0 0 20px oklch(0.85 0.18 220 / 30%)" }}>
          <Icon className="h-4 w-4" style={{ color: "var(--neon)" }} />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

function Settings() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  const { data: languages = [] } = useQuery({ queryKey: ["languages"], queryFn: () => listLanguages() });

  const [form, setForm] = useState({
    full_name: "", specialty: "", clinic: "", hospital: "", phone: "",
    preferred_language: "English", notify_email: true, notify_alerts: true,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      specialty: profile.specialty ?? "",
      clinic: profile.clinic ?? "",
      hospital: profile.hospital ?? "",
      phone: profile.phone ?? "",
      preferred_language: profile.preferred_language ?? "English",
      notify_email: profile.notify_email ?? true,
      notify_alerts: profile.notify_alerts ?? true,
    });
  }, [profile]);

  const saveMut = useMutation({
    mutationFn: () => updateMyProfile({ data: form }),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  return (
    <AppShell title="Settings" subtitle="Manage your profile, hospital, and preferences.">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Section icon={User} title="Doctor profile" desc="Displayed on all generated notes">
              <div className="space-y-2"><Label>Full name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="h-10 rounded-xl bg-card/60" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Specialty</Label>
                  <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="h-10 rounded-xl bg-card/60" />
                </div>
                <div className="space-y-2"><Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-10 rounded-xl bg-card/60" />
                </div>
              </div>
            </Section>

            <Section icon={Building2} title="Hospital details" desc="Appears on printed and downloaded notes">
              <div className="space-y-2"><Label>Hospital name</Label>
                <Input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} className="h-10 rounded-xl bg-card/60" />
              </div>
              <div className="space-y-2"><Label>Clinic / department</Label>
                <Input value={form.clinic} onChange={(e) => setForm({ ...form, clinic: e.target.value })} className="h-10 rounded-xl bg-card/60" />
              </div>
            </Section>

            <Section icon={Globe} title="Language" desc="Default consultation language">
              <div className="space-y-2">
                <Label>Primary language</Label>
                <Select value={form.preferred_language} onValueChange={(v) => setForm({ ...form, preferred_language: v })}>
                  <SelectTrigger className="h-10 rounded-xl bg-card/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (<SelectItem key={l.code} value={l.name}>{l.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </Section>

            <Section icon={Bell} title="Notifications" desc="Choose what MediScribe alerts you about">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 p-4">
                <div className="text-sm">Email notifications</div>
                <Switch checked={form.notify_email} onCheckedChange={(v) => setForm({ ...form, notify_email: v })} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 p-4">
                <div className="text-sm">Critical clinical alerts</div>
                <Switch checked={form.notify_alerts} onCheckedChange={(v) => setForm({ ...form, notify_alerts: v })} />
              </div>
            </Section>
          </div>

          <div className="mt-8 flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl border-white/10 bg-card/60" onClick={() => profile && setForm({
              full_name: profile.full_name ?? "", specialty: profile.specialty ?? "", clinic: profile.clinic ?? "",
              hospital: profile.hospital ?? "", phone: profile.phone ?? "", preferred_language: profile.preferred_language ?? "English",
              notify_email: profile.notify_email ?? true, notify_alerts: profile.notify_alerts ?? true,
            })}>Cancel</Button>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
              className="rounded-xl text-primary-foreground hover-lift" style={{ background: "var(--gradient-primary)" }}>
              {saveMut.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
