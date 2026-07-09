import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, User, Palette, Bell, KeyRound, Globe } from "lucide-react";

export const Route = createFileRoute("/settings")({
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
  return (
    <AppShell title="Settings" subtitle="Manage your profile, hospital, and platform preferences.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Section icon={User} title="Doctor profile" desc="Displayed on all generated notes">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>First name</Label><Input defaultValue="Ananya" className="h-10 rounded-xl bg-card/60" /></div>
            <div className="space-y-2"><Label>Last name</Label><Input defaultValue="Rao" className="h-10 rounded-xl bg-card/60" /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input defaultValue="a.rao@mediscribe.ai" className="h-10 rounded-xl bg-card/60" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Specialty</Label><Input defaultValue="Internal Medicine" className="h-10 rounded-xl bg-card/60" /></div>
            <div className="space-y-2"><Label>License #</Label><Input defaultValue="MCI-88432" className="h-10 rounded-xl bg-card/60" /></div>
          </div>
        </Section>

        <Section icon={Building2} title="Hospital details" desc="Appears on printed and downloaded notes">
          <div className="space-y-2"><Label>Hospital name</Label><Input defaultValue="Apollo Health City" className="h-10 rounded-xl bg-card/60" /></div>
          <div className="space-y-2"><Label>Address</Label><Textarea defaultValue="Jubilee Hills, Hyderabad, Telangana 500033" className="min-h-[80px] rounded-xl bg-card/60" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Phone</Label><Input defaultValue="+91 40 2360 7777" className="h-10 rounded-xl bg-card/60" /></div>
            <div className="space-y-2"><Label>Website</Label><Input defaultValue="apollohealthcity.com" className="h-10 rounded-xl bg-card/60" /></div>
          </div>
        </Section>

        <Section icon={Palette} title="Appearance" desc="Personalize the interface">
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 p-4">
            <div><div className="text-sm font-semibold">Dark mode</div><div className="text-xs text-muted-foreground">Preferred for clinical settings</div></div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label>Accent</Label>
            <div className="flex gap-2">
              {["var(--neon)", "var(--emerald)", "var(--violet)", "var(--cyan)", "var(--danger)"].map((c, i) => (
                <button key={i} className={`h-9 w-9 rounded-xl ring-2 ${i === 0 ? "ring-white/30" : "ring-transparent"}`} style={{ background: c, boxShadow: `0 0 16px ${c}` }} />
              ))}
            </div>
          </div>
        </Section>

        <Section icon={Globe} title="Language" desc="Default consultation language">
          <div className="space-y-2">
            <Label>Primary language</Label>
            <Select defaultValue="en">
              <SelectTrigger className="h-10 rounded-xl bg-card/60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="te">Telugu</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 p-4">
            <div><div className="text-sm font-semibold">Auto-detect language</div><div className="text-xs text-muted-foreground">AI picks the language per consultation</div></div>
            <Switch defaultChecked />
          </div>
        </Section>

        <Section icon={Bell} title="Notifications" desc="Choose what MediScribe alerts you about">
          {[
            ["Critical clinical alerts", true],
            ["New SOAP note generated", true],
            ["Weekly analytics digest", false],
            ["Product updates", false],
          ].map(([l, on]) => (
            <div key={l as string} className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 p-4">
              <div className="text-sm">{l as string}</div>
              <Switch defaultChecked={on as boolean} />
            </div>
          ))}
        </Section>

        <Section icon={KeyRound} title="API settings" desc="For EHR / third-party integrations">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input readOnly defaultValue="ms_live_sk_9f8a…7b3c" className="h-10 rounded-xl bg-card/60 font-mono text-xs" />
              <Button variant="outline" className="rounded-xl border-white/10 bg-card/60">Rotate</Button>
            </div>
          </div>
          <div className="space-y-2"><Label>Webhook URL</Label><Input placeholder="https://ehr.example.com/hooks/mediscribe" className="h-10 rounded-xl bg-card/60" /></div>
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 p-4">
            <div><div className="text-sm font-semibold">EHR sync</div><div className="text-xs text-muted-foreground">Push SOAP notes to connected EHR</div></div>
            <Switch />
          </div>
        </Section>
      </div>

      <div className="mt-8 flex justify-end gap-2">
        <Button variant="outline" className="rounded-xl border-white/10 bg-card/60">Cancel</Button>
        <Button className="rounded-xl text-primary-foreground hover-lift" style={{ background: "var(--gradient-primary)" }}>Save changes</Button>
      </div>
    </AppShell>
  );
}
