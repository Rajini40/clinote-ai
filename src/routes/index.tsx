import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Mic, Brain, Globe, Shield, BarChart3, AlertTriangle,
  ArrowRight, Play, Sparkles, CheckCircle2, Stethoscope,
} from "lucide-react";
import { Logo } from "@/components/mediscribe/Logo";
import { Orbit } from "@/components/mediscribe/Orbit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediScribe — AI Clinical Scribe for Multilingual SOAP Notes" },
      { name: "description", content: "Turn doctor–patient conversations into structured SOAP notes in seconds. Multilingual, secure, and built for modern clinics." },
      { property: "og:title", content: "MediScribe — AI Clinical Scribe" },
      { property: "og:description", content: "Automated SOAP note generation from doctor–patient conversations. English, Telugu, Hindi." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mic, title: "AI Speech Recognition", desc: "State-of-the-art multilingual ASR trained on clinical vocabulary and accents.", color: "var(--neon)" },
  { icon: Brain, title: "SOAP Note Generation", desc: "Generative AI structures conversations into Subjective, Objective, Assessment, and Plan.", color: "var(--violet)" },
  { icon: Globe, title: "Multilingual Support", desc: "English, Telugu, and Hindi out of the box — with medical terminology preserved.", color: "var(--emerald)" },
  { icon: Shield, title: "Secure Cloud Records", desc: "HIPAA-aligned encryption at rest and in transit. Role-based patient access.", color: "var(--cyan)" },
  { icon: BarChart3, title: "Medical Analytics", desc: "Track consultations, diagnoses, and documentation performance in real time.", color: "var(--neon)" },
  { icon: AlertTriangle, title: "Critical Alert Detection", desc: "Automatic flagging of red-flag symptoms, allergies, and drug interactions.", color: "var(--danger)" },
];

const stats = [
  { value: "95%", label: "Documentation Accuracy" },
  { value: "80%", label: "Physician Time Saved" },
  { value: "3", label: "Supported Languages" },
  { value: "1,000+", label: "Consultations Processed" },
];

const testimonials = [
  { quote: "MediScribe cut my after-hours charting to almost zero. It just understands clinical context.", name: "Dr. Ananya Rao", role: "Internal Medicine, Apollo" },
  { quote: "The Telugu and Hindi transcription is startlingly accurate — a game changer for our clinic.", name: "Dr. Rakesh Iyer", role: "General Physician, KIMS" },
  { quote: "SOAP notes generated in under a minute. Our follow-up quality improved measurably.", name: "Dr. Priya Menon", role: "Family Medicine, Fortis" },
];

const hospitals = ["Apollo", "Fortis", "AIIMS", "Manipal", "KIMS", "Narayana"];

function Landing() {
  return (
    <div className="relative overflow-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl" style={{ background: "color-mix(in oklab, var(--background) 70%, transparent)" }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground">Impact</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">Clinicians</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">Sign in</Link>
            <Link to="/dashboard">
              <Button className="rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                Launch app <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--neon)" }} />
              <span className="text-muted-foreground">Generative AI · Clinically tuned</span>
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              The AI clinical scribe your <span className="text-aurora">practice deserves</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              MediScribe listens to doctor–patient conversations in English, Telugu, or Hindi and
              generates structured SOAP notes — instantly. Reduce physician burnout, capture more
              detail, and get back to caring for patients.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/consultation">
                <Button size="lg" className="rounded-xl text-primary-foreground hover-lift" style={{ background: "var(--gradient-primary)" }}>
                  <Mic className="mr-2 h-4 w-4" /> Start Consultation
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-xl border-white/15 bg-card/40 backdrop-blur">
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
              <a href="#features">
                <Button size="lg" variant="ghost" className="rounded-xl">Learn more</Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {["HIPAA-aligned encryption", "SOC 2 roadmap", "99.9% uptime SLA"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--emerald)" }} /> {t}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <Orbit />
          </motion.div>
        </div>
      </section>

      {/* Hospital logos */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">Trusted by leading hospitals</p>
        <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-6">
          {hospitals.map((h) => (
            <div key={h} className="glass grid h-14 place-items-center rounded-xl text-sm font-semibold tracking-wider text-muted-foreground">
              {h}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Everything a modern clinic needs</h2>
          <p className="mt-4 text-muted-foreground">Built for the way physicians actually work — fast, multilingual, and clinically aware.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass hover-lift group relative overflow-hidden rounded-2xl p-6"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40" style={{ background: f.color }} />
              <div className="relative grid h-11 w-11 place-items-center rounded-xl glass" style={{ boxShadow: `0 0 24px ${f.color}55` }}>
                <f.icon className="h-5 w-5" style={{ color: f.color }} />
              </div>
              <h3 className="relative mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 md:p-14">
          <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-aurora)" }} />
          <div className="relative grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-bold md:text-6xl text-aurora">{s.value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Loved by clinicians</h2>
          <p className="mt-4 text-muted-foreground">From tertiary hospitals to solo practices — MediScribe fits.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6">
              <Stethoscope className="h-5 w-5" style={{ color: "var(--neon)" }} />
              <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 border-t border-white/5 pt-4">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center md:p-16">
          <div className="absolute inset-0 opacity-40 animate-gradient" style={{ background: "var(--gradient-aurora)" }} />
          <div className="relative">
            <h2 className="text-4xl font-bold md:text-5xl">Ready to give your notes back to your patients?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Start your first AI-powered consultation in under a minute.</p>
            <Link to="/dashboard">
              <Button size="lg" className="mt-8 rounded-xl text-primary-foreground hover-lift" style={{ background: "var(--gradient-primary)" }}>
                Open dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 text-xs text-muted-foreground">Multilingual AI clinical scribe for automated SOAP note generation.</p>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Security", "Changelog"] },
            { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "HIPAA", "DPA"] },
          ].map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold">{c.title}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {c.links.map((l) => (<li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MediScribe. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
