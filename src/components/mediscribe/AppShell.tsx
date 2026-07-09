import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Mic, Users, FileText, BarChart3, History, Settings,
  Bell, Search, Moon, Sun, CircleUser, Command,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/consultation", label: "New Consultation", icon: Mic },
  { to: "/patients", label: "Patient Records", icon: Users },
  { to: "/soap", label: "SOAP Notes", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(true);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 p-4 md:flex" style={{ background: "color-mix(in oklab, var(--sidebar) 90%, transparent)", backdropFilter: "blur(20px)" }}>
        <div className="px-2 py-3"><Logo /></div>
        <nav className="mt-6 flex flex-col gap-1">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {active && (
                  <span
                    className="absolute inset-0 rounded-xl opacity-90"
                    style={{ background: "linear-gradient(90deg, oklch(0.85 0.18 220 / 20%), oklch(0.7 0.22 300 / 15%))", boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 8%)" }}
                  />
                )}
                <Icon className={`relative h-4 w-4 ${active ? "text-[color:var(--neon)]" : ""}`} />
                <span className="relative">{n.label}</span>
                {n.label === "New Consultation" && (
                  <Badge className="relative ml-auto border-0 bg-emerald-400/15 text-[10px] text-[color:var(--emerald)]">AI</Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--emerald)" }} />
              <span className="text-muted-foreground">AI engine online</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">v2.4 · uptime 99.98%</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-white/5 backdrop-blur-xl" style={{ background: "color-mix(in oklab, var(--background) 65%, transparent)" }}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 md:px-8 md:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search patients, notes, diagnoses…" className="h-10 rounded-xl bg-card/60 pl-10 pr-16" />
                <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 bg-card/60 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
                  <Command className="h-3 w-3" /> K
                </kbd>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setDark((d) => !d)}>
                {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="relative rounded-xl">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full" style={{ background: "var(--danger)" }} />
              </Button>
              <div className="hidden items-center gap-2 rounded-xl glass px-2 py-1 sm:flex">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-transparent text-xs"><CircleUser className="h-4 w-4" /></AvatarFallback></Avatar>
                <div className="pr-2 leading-tight">
                  <div className="text-xs font-semibold">Dr. A. Rao</div>
                  <div className="text-[10px] text-muted-foreground">Internal Medicine</div>
                </div>
              </div>
            </div>
          </div>
          {(title || subtitle) && (
            <div className="border-t border-white/5 px-4 py-4 md:px-8">
              {title && <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>}
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
