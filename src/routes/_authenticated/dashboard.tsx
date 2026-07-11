import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, Stethoscope, AlertTriangle, Clock, Languages, ArrowUpRight,
  Mic, ArrowRight, Loader2,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis,
  PieChart, Pie, Cell,
} from "recharts";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getAnalyticsData } from "@/lib/analytics.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function fmtDuration(s: number) {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  return `${Math.round(s / 60)}m`;
}

function fmtWhen(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 60000;
  if (diff < 60) return `${Math.max(1, Math.round(diff))} min ago`;
  if (diff < 60 * 24) return `${Math.round(diff / 60)} hr ago`;
  return d.toLocaleDateString();
}

const langColors = ["oklch(0.85 0.18 220)", "oklch(0.78 0.18 160)", "oklch(0.7 0.22 300)", "oklch(0.75 0.2 40)", "oklch(0.78 0.18 100)"];

function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(),
  });
  const { data: analytics } = useQuery({
    queryKey: ["analytics-lite"],
    queryFn: () => getAnalyticsData(),
  });

  const kpis = [
    { label: "Total Patients", value: String(stats?.totalPatients ?? 0), icon: Users, color: "var(--neon)", delta: "All time" },
    { label: "Today's Consultations", value: String(stats?.todaysConsultations ?? 0), icon: Stethoscope, color: "var(--cyan)", delta: "Since midnight" },
    { label: "Critical Alerts", value: String(stats?.criticalAlerts ?? 0), icon: AlertTriangle, color: "var(--danger)", delta: "Unacknowledged" },
    { label: "Avg Doc Time", value: fmtDuration(stats?.avgDurationSeconds ?? 0), icon: Clock, color: "var(--emerald)", delta: "Per consult" },
    { label: "Languages", value: String(stats?.languagesUsed ?? 0), icon: Languages, color: "var(--violet)", delta: "In use" },
  ];

  const langs = Object.entries(stats?.languageBreakdown ?? {}).map(([name, count], i) => ({
    name, value: count as number, color: langColors[i % langColors.length],
  }));

  return (
    <AppShell title="Dashboard" subtitle="Real-time overview of your clinical practice.">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading live data…
        </div>
      )}

      <div className="mt-2 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {kpis.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass hover-lift group relative overflow-hidden rounded-2xl p-5">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ background: item.color }} />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</div>
                  <div className="mt-2 text-3xl font-bold">{item.value}</div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl glass" style={{ boxShadow: `0 0 20px ${item.color}55` }}>
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
              </div>
              <div className="relative mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3" style={{ color: item.color }} />
                <span>{item.delta}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Consultations · last 7 days</h3>
              <p className="text-xs text-muted-foreground">Auto-refreshing from your database</p>
            </div>
            <Link to="/consultation"><Button size="sm" className="rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Mic className="mr-1.5 h-3.5 w-3.5" /> New</Button></Link>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.weekly ?? []}>
                <defs>
                  <linearGradient id="dashG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.85 0.18 220)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.85 0.18 220)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <ReTooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.85 0.18 220)" strokeWidth={2} fill="url(#dashG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold">Language mix</h3>
          <div className="mt-2 h-56">
            {langs.length === 0 ? (
              <div className="grid h-full place-items-center text-xs text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={langs} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {langs.map((l) => <Cell key={l.name} fill={l.color} stroke="transparent" />)}
                  </Pie>
                  <ReTooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-1.5">
            {langs.map((l) => (
              <div key={l.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: l.color }} />{l.name}</div>
                <span className="text-muted-foreground">{l.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass mt-6 overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between p-6 pb-3">
          <div>
            <h3 className="text-sm font-semibold">Recent consultations</h3>
            <p className="text-xs text-muted-foreground">Latest 10 across your practice</p>
          </div>
          <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Patient</th>
                <th className="px-6 py-3 font-medium">Language</th>
                <th className="px-6 py-3 font-medium">Diagnosis</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recent ?? []).length === 0 && !isLoading && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                  No consultations yet — <Link to="/consultation" className="underline">start your first one</Link>.
                </td></tr>
              )}
              {(stats?.recent ?? []).map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 font-medium">{r.patient_name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.language}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.diagnosis ?? "—"}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="border-white/10 bg-card/60">{r.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{fmtWhen(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
