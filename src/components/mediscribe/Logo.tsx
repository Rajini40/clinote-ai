import { Activity } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative grid h-9 w-9 place-items-center rounded-xl glow"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight">
          Medi<span className="text-aurora">Scribe</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          AI Clinical Scribe
        </span>
      </div>
    </div>
  );
}
