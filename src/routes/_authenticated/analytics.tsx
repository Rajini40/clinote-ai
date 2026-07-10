import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Radar,
  RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis,
} from "recharts";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Badge } from "@/components/ui/badge";
import { Users, Stethoscope, TrendingUp, ShieldCheck, AlertTriangle, Clock } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: Analytics,
});

const consult = [
  { d: "Mon", v: 42 }, { d: "Tue", v: 58 }, { d: "Wed", v: 51 }, { d: "Thu", v: 74 },
  { d: "Fri", v: 66 }, { d: "Sat", v: 38 }, { d: "Sun", v: 22 },
];
const symptoms = [
  { s: "Chest pain", v: 88 }, { s: "Fatigue", v: 76 }, { s: "Cough", v: 71 },
  { s: "Headache", v: 65 }, { s: "Fever", v: 58 }, { s: "Nausea", v: 44 },
];
const diseases = [
  { d: "HTN", v: 132 }, { d: "T2 DM", v: 108 }, { d: "URTI", v: 94 },
  { d: "Asthma", v: 62 }, { d: "GERD", v: 51 }, { d: "Migraine", v: 41 },
];
const langs = [
  { name: "English", value: 58, color: "oklch(0.85 0.18 220)" },
  { name: "Telugu",  value: 24, color: "oklch(0.78 0.18 160)" },
  { name: "Hindi",   value: 18, color: "oklch(0.7 0.22 300)" },
];
const accuracy = [
  { m: "May", v: 91 }, { m: "Jun", v: 92 }, { m: "Jul", v: 93 }, { m: "Aug", v: 94 },
  { m: "Sep", v: 95 }, { m: "Oct", v: 96 }, { m: "Nov", v: 97 },
];

const kpi = [
  { label: "Total Patients", value: "2,847", icon: Users, color: "var(--neon)" },
  { label: "Consultations", value: "6,412", icon: Stethoscope, color: "var(--cyan)" },
  { label: "Avg Time", value: "42s", icon: Clock, color: "var(--emerald)" },
  { label: "AI Accuracy", value: "96.4%", icon: ShieldCheck, color: "var(--violet)" },
  { label: "Critical Alerts", value: "148", icon: AlertTriangle, color: "var(--danger)" },
  { label: "Growth", value: "+38%", icon: TrendingUp, color: "var(--neon)" },
];

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

const tooltipStyle = { background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 };

function Analytics() {
  return (
    <AppShell title="Analytics" subtitle="Real-time performance across your practice.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {kpi.map((k) => (
          <div key={k.label} className="glass hover-lift relative overflow-hidden rounded-2xl p-5">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: k.color }} />
            <div className="relative flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl glass" style={{ boxShadow: `0 0 20px ${k.color}55` }}>
                <k.icon className="h-4 w-4" style={{ color: k.color }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.label}</div>
                <div className="text-lg font-bold">{k.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Weekly consultations" subtitle="Last 7 days" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consult}>
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.22 300)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="oklch(0.7 0.22 300)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.7 0.22 300)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Language distribution" subtitle="Rolling 30d">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={langs} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {langs.map((l) => <Cell key={l.name} fill={l.color} stroke="transparent" />)}
                </Pie>
                <ReTooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {langs.map((l) => (
              <div key={l.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: l.color }} />{l.name}</div>
                <span className="text-muted-foreground">{l.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Most common symptoms" subtitle="Radar view">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={symptoms}>
                <PolarGrid stroke="oklch(1 0 0 / 8%)" />
                <PolarAngleAxis dataKey="s" stroke="oklch(0.72 0.02 250)" fontSize={10} />
                <Radar dataKey="v" stroke="oklch(0.85 0.18 220)" fill="oklch(0.85 0.18 220)" fillOpacity={0.4} />
                <ReTooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top diseases" subtitle="This quarter" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseases}>
                <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="v" radius={[8, 8, 0, 0]}>
                  {diseases.map((_, i) => (<Cell key={i} fill={`oklch(${0.7 + (i % 3) * 0.05} 0.2 ${180 + i * 25})`} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="AI accuracy trend" subtitle="Monthly transcription + SOAP fidelity">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracy}>
                <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[85, 100]} stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="v" stroke="oklch(0.78 0.18 160)" strokeWidth={2.5} dot={{ fill: "oklch(0.78 0.18 160)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Critical alerts breakdown" subtitle="Last 30 days">
          <div className="space-y-3">
            {[
              { l: "Cardiovascular", v: 62, c: "var(--danger)" },
              { l: "Metabolic", v: 34, c: "var(--violet)" },
              { l: "Respiratory", v: 28, c: "var(--cyan)" },
              { l: "Allergy/Drug", v: 24, c: "var(--emerald)" },
            ].map((r) => (
              <div key={r.l}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{r.l}</span>
                  <Badge variant="outline" className="border-white/10 bg-card/60">{r.v}</Badge>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.c, boxShadow: `0 0 12px ${r.c}` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
