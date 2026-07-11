import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Radar,
  RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis,
} from "recharts";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Badge } from "@/components/ui/badge";
import { Users, Stethoscope, TrendingUp, ShieldCheck, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { getAnalyticsData } from "@/lib/analytics.functions";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: Analytics,
});

const tooltipStyle = { background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 };
const langColors = ["oklch(0.85 0.18 220)", "oklch(0.78 0.18 160)", "oklch(0.7 0.22 300)", "oklch(0.75 0.2 40)", "oklch(0.78 0.18 100)"];

function fmtDur(s: number) { return s ? (s < 60 ? `${s}s` : `${Math.round(s / 60)}m`) : "—"; }

function Card({ title, subtitle, children, className = "" }: any) {
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

function Analytics() {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: () => getAnalyticsData() });

  const kpi = [
    { label: "Total Patients", value: String(data?.totalPatients ?? 0), icon: Users, color: "var(--neon)" },
    { label: "Consultations 30d", value: String(data?.totalConsultations ?? 0), icon: Stethoscope, color: "var(--cyan)" },
    { label: "Avg Time", value: fmtDur(data?.avgDurationSeconds ?? 0), icon: Clock, color: "var(--emerald)" },
    { label: "Languages", value: String(data?.languages.length ?? 0), icon: ShieldCheck, color: "var(--violet)" },
    { label: "Critical Alerts", value: String(data?.criticalAlerts ?? 0), icon: AlertTriangle, color: "var(--danger)" },
    { label: "Diagnoses", value: String(data?.topDiseases.length ?? 0), icon: TrendingUp, color: "var(--neon)" },
  ];

  const langs = (data?.languages ?? []).map((l, i) => ({ ...l, color: langColors[i % langColors.length] }));
  const severityRows = Object.entries(data?.alertBySeverity ?? {}).map(([l, v]) => ({
    l, v: v as number, c: l === "critical" ? "var(--danger)" : l === "high" ? "var(--violet)" : l === "warning" ? "var(--cyan)" : "var(--emerald)",
  }));
  const maxSeverity = Math.max(1, ...severityRows.map((r) => r.v));

  return (
    <AppShell title="Analytics" subtitle="Real-time performance across your practice.">
      {isLoading && <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading analytics…</div>}

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
              <AreaChart data={data?.weekly ?? []}>
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.22 300)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="oklch(0.7 0.22 300)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <ReTooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.7 0.22 300)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Language distribution" subtitle="Rolling 30d">
          <div className="h-56">
            {langs.length === 0 ? (
              <div className="grid h-full place-items-center text-xs text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={langs} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {langs.map((l) => <Cell key={l.name} fill={l.color} stroke="transparent" />)}
                  </Pie>
                  <ReTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
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
        <Card title="Top diagnoses" subtitle="Last 30 days" className="lg:col-span-2">
          <div className="h-64">
            {(data?.topDiseases ?? []).length === 0 ? (
              <div className="grid h-full place-items-center text-xs text-muted-foreground">No diagnoses recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.topDiseases ?? []}>
                  <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                  <XAxis dataKey="d" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ReTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="v" radius={[8, 8, 0, 0]}>
                    {(data?.topDiseases ?? []).map((_, i) => (<Cell key={i} fill={`oklch(${0.7 + (i % 3) * 0.05} 0.2 ${180 + i * 25})`} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="Alerts by severity" subtitle="Last 30 days">
          <div className="space-y-3">
            {severityRows.length === 0 ? (
              <div className="text-xs text-muted-foreground">No alerts</div>
            ) : severityRows.map((r) => (
              <div key={r.l}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{r.l}</span>
                  <Badge variant="outline" className="border-white/10 bg-card/60">{r.v}</Badge>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${(r.v / maxSeverity) * 100}%`, background: r.c, boxShadow: `0 0 12px ${r.c}` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
