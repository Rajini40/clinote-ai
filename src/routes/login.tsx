import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Stethoscope, Shield, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/mediscribe/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MediScribe" },
      { name: "description", content: "Sign in to your MediScribe clinical scribe account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 800);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated aurora blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl animate-float" style={{ background: "var(--neon)" }} />
        <div className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl animate-float" style={{ background: "var(--violet)", animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full opacity-30 blur-3xl animate-float" style={{ background: "var(--emerald)", animationDelay: "2s" }} />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Left panel — illustration */}
        <div className="relative hidden flex-col justify-between p-12 lg:flex">
          <Logo />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md">
            <div className="glass-strong rounded-3xl p-8">
              <Stethoscope className="h-8 w-8" style={{ color: "var(--neon)" }} />
              <h2 className="mt-6 text-3xl font-bold leading-tight">
                Documentation that <span className="text-aurora">writes itself.</span>
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Sign in to start recording consultations and let MediScribe handle the SOAP notes.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  { icon: Sparkles, text: "AI-generated SOAP notes in seconds" },
                  { icon: Shield, text: "HIPAA-aligned end-to-end encryption" },
                  { icon: Stethoscope, text: "Trained on real clinical conversations" },
                ].map((i) => (
                  <div key={i.text} className="flex items-center gap-3 text-sm">
                    <div className="grid h-8 w-8 place-items-center rounded-lg glass">
                      <i.icon className="h-4 w-4" style={{ color: "var(--cyan)" }} />
                    </div>
                    {i.text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MediScribe</p>
        </div>

        {/* Right — form */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
            <div className="mb-8 lg:hidden"><Logo /></div>
            <div className="glass-strong rounded-3xl p-8 md:p-10">
              <h1 className="text-3xl font-bold">Doctor Sign in</h1>
              <p className="mt-2 text-sm text-muted-foreground">Welcome back. Enter your credentials to continue.</p>

              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue="doctor@mediscribe.ai" className="h-11 rounded-xl bg-card/60 pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" defaultValue="password" className="h-11 rounded-xl bg-card/60 pl-10" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" defaultChecked />
                  <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me for 30 days</Label>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-xl text-primary-foreground hover-lift"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {loading ? "Signing in…" : (<>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>)}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                New to MediScribe? <Link to="/" className="text-foreground hover:underline">Request access</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
