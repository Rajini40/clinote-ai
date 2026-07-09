import { motion } from "framer-motion";
import { Brain, Mic, Stethoscope, FileText, User, HeartPulse } from "lucide-react";

const nodes = [
  { icon: Stethoscope, label: "Doctor", angle: 0, color: "var(--neon)" },
  { icon: User, label: "Patient", angle: 60, color: "var(--cyan)" },
  { icon: Mic, label: "Speech", angle: 120, color: "var(--emerald)" },
  { icon: FileText, label: "SOAP", angle: 180, color: "var(--violet)" },
  { icon: HeartPulse, label: "Vitals", angle: 240, color: "var(--neon)" },
  { icon: Brain, label: "AI", angle: 300, color: "var(--violet)" },
];

export function Orbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* Radial gradient backdrop */}
      <div
        className="absolute inset-0 rounded-full opacity-60 blur-3xl"
        style={{ background: "var(--gradient-aurora)" }}
      />

      {/* Concentric rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-white/10"
          style={{ margin: `${i * 40}px` }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 40 + i * 10, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Center AI core */}
      <motion.div
        className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl glass-strong glow-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="absolute inset-0 rounded-3xl opacity-70"
          style={{ background: "var(--gradient-primary)" }}
        />
        <Brain className="relative h-12 w-12 text-primary-foreground" strokeWidth={1.5} />
      </motion.div>

      {/* Orbiting nodes */}
      {nodes.map((n, idx) => {
        const rad = (n.angle * Math.PI) / 180;
        const r = 42; // percent
        const x = 50 + r * Math.cos(rad);
        const y = 50 + r * Math.sin(rad);
        const Icon = n.icon;
        return (
          <motion.div
            key={n.label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: idx * 0.3, ease: "easeInOut" }}
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl glass border border-white/10">
              <Icon className="h-6 w-6" style={{ color: n.color }} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {n.label}
            </span>
          </motion.div>
        );
      })}

      {/* Connection lines (SVG) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.18 220)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="oklch(0.7 0.22 300)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {nodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const r = 42;
          const x = 50 + r * Math.cos(rad);
          const y = 50 + r * Math.sin(rad);
          return (
            <line
              key={n.label}
              x1="50" y1="50" x2={x} y2={y}
              stroke="url(#line-grad)" strokeWidth="0.2" strokeDasharray="0.5 0.8"
            />
          );
        })}
      </svg>
    </div>
  );
}
