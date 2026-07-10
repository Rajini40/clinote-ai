import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users, Stethoscope, AlertTriangle, Clock, Languages, ArrowUpRight,
  Mic, ArrowRight, Activity,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { AppShell } from "@/components/mediscribe/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MediScribe" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

const kpis = [
  { label: "Total Patients", value: "2,847", delta: "+12.4%", icon: Users, color: "var(--neon)" },
  { label: "Today's Consultations", value: "38", delta: "+6", icon: Stethoscope, color: "var(--cyan)" },
  { label: "Critical Alerts", value: "4", delta: "2 new", icon: AlertTriangle, color: "var(--danger)" },
  { label: "Avg Doc Time", value: "42s", delta: "-18%", icon: Clock, color: "var(--emerald)" },
  { label: "Languages Used", value: "3", delta: "EN · TE · HI", icon: Languages, color: "var(--violet)" },
];

const monthly = [
  { m: "Jan", v: 210 }, { m: "Feb", v: 280 }, { m: "Mar", v: 340 },
  { m: "Apr", v: 400 }, { m: "May", v: 520 }, { m: "Jun", v: 610 },
  { m: "Jul", v: 720 }, { m: "Aug", v: 800 }, { m: "Sep", v: 940 },
];

const langs = [
  { name: "English", value: 58, color: "oklch(0.85 0.18 220)" },
  { name: "Telugu",  value: 24, color: "oklch(0.78 0.18 160)" },
  { name: "Hindi",   value: 18, color: "oklch(0.7 0.22 300)" },
];

const diseases = [
  { name: "Hypertension", v: 92 },
  { name: "Diabetes T2", v: 78 },
  { name: "URTI", v: 64 },
  { name: "Asthma", v: 41 },
  { name: "Migraine", v: 33 },
];

const recent = [
  { p: "Ravi Kumar", d: "Dr. A. Rao", lang: "Telugu", dx: "Hypertension follow-up", t: "12 min ago", s: "Completed" },
  { p: "Meera Shah", d: "Dr. A. Rao", lang: "English", dx: "Migraine, chronic", t: "38 min ago", s: "Completed" },
  { p: "Arjun Patel", d: "Dr. P. Menon", lang: "Hindi", dx: "T2 Diabetes review", t: "1 hr ago", s: "Review" },
  { p: "Lakshmi Devi", d: "Dr. A. Rao", lang: "Telugu", dx: "URTI", t: "2 hr ago", s: "Completed" },
  { p: "Farhan Ali", d: "Dr. R. Iyer", lang: "Hindi", dx: "Asthma flare", t: "3 hr ago", s: "Alert" },
];

function Kpi({ item, i }: { item: typeof kpis[number]; i: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      className="glass hover-lift group relative overflow-hidden rounded-2xl p-5"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl group-hover:opacity-40" style={{ background: item.color }} />
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
        <span>vs last week</span>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  return (
    <AppShell title="Welcome back, Dr. Rao" subtitle="Here's what's happening across your practice today.">
      {/* Hero action */}
      <div className="glass-strong relative mb-6 overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="absolute inset-0 opacity-30 animate-gradient" style={{ background: "var(--gradient-aurora)" }} />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Activity className="h-3 w-3" style={{ color: "var(--emerald)" }} /> Live AI scribe ready
            </div>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">Start a new consultation</h2>
            <p className="mt-1 text-sm text-muted-foreground">Record or upload audio — we'll return a structured SOAP note in seconds.</p>
          </div>
          <Link to="/consultation">
            <Button size="lg" className="rounded-xl text-primary-foreground hover-lift" style={{ background: "var(--gradient-primary)" }}>
              <Mic className="mr-2 h-4 w-4" /> New Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k, i) => (<Kpi key={k.label} item={k} i={i} />))}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Monthly consultations</h3>
              <p className="text-xs text-muted-foreground">Rolling 9-month trend</p>
            </div>
            <Badge variant="outline" className="border-white/10 bg-card/60">+38% YoY</Badge>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.85 0.18 220)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="oklch(0.85 0.18 220)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.85 0.18 220)" strokeWidth={2} fill="url(#ga)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold">Language distribution</h3>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={langs} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {langs.map((l) => <Cell key={l.name} fill={l.color} stroke="transparent" />)}
                </Pie>
                <ReTooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {langs.map((l) => (
              <div key={l.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: l.color }} />{l.name}</div>
                <span className="text-muted-foreground">{l.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <h3 className="text-sm font-semibold">Top diagnoses</h3>
          <p className="text-xs text-muted-foreground">This month</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseases} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <ReTooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="oklch(0.7 0.22 300)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent table */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Recent consultations</h3>
              <p className="text-xs text-muted-foreground">Latest activity across your team</p>
            </div>
            <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">Patient</th>
                  <th className="py-2 font-medium">Doctor</th>
                  <th className="py-2 font-medium">Language</th>
                  <th className="py-2 font-medium">Diagnosis</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.p + r.t} className="border-t border-white/5">
                    <td className="py-3">
                      <div className="font-medium">{r.p}</div>
                      <div className="text-[11px] text-muted-foreground">{r.t}</div>
                    </td>
                    <td className="py-3 text-muted-foreground">{r.d}</td>
                    <td className="py-3"><Badge variant="outline" className="border-white/10 bg-card/60 text-[10px]">{r.lang}</Badge></td>
                    <td className="py-3 text-muted-foreground">{r.dx}</td>
                    <td className="py-3">
                      <Badge className={`border-0 text-[10px] ${
                        r.s === "Alert" ? "bg-rose-400/15 text-[color:var(--danger)]" :
                        r.s === "Review" ? "bg-amber-400/15 text-amber-300" :
                        "bg-emerald-400/15 text-[color:var(--emerald)]"
                      }`}>{r.s}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
