import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Stethoscope, Shield, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/mediscribe/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl animate-float" style={{ background: "var(--neon)" }} />
        <div className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl animate-float" style={{ background: "var(--violet)", animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full opacity-30 blur-3xl animate-float" style={{ background: "var(--emerald)", animationDelay: "2s" }} />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-2">
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

        <div className="flex items-center justify-center p-6 md:p-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
            <div className="mb-8 lg:hidden"><Logo /></div>
            <div className="glass-strong rounded-3xl p-8 md:p-10">
              <h1 className="text-3xl font-bold">
                {mode === "signin" ? "Doctor Sign in" : "Create your account"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Welcome back. Enter your credentials to continue."
                  : "Join MediScribe and automate your clinical notes."}
              </p>

              <Button
                type="button"
                onClick={onGoogle}
                disabled={loading}
                variant="outline"
                className="mt-6 h-11 w-full rounded-xl border-white/10 bg-card/60"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.5-1.7 4.3-5.5 4.3-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.6 14.6 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12S6.9 21.3 12 21.3c6.9 0 9.5-4.8 9.5-7.3 0-.5-.1-.9-.1-1.3H12z"/></svg>
                Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11 rounded-xl bg-card/60 pl-10" placeholder="Dr. A. Rao" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-xl bg-card/60 pl-10" placeholder="doctor@clinic.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11 rounded-xl bg-card/60 pl-10" placeholder="••••••••" />
                  </div>
                </div>
                {mode === "signin" && (
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" defaultChecked />
                    <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me for 30 days</Label>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-xl text-primary-foreground hover-lift"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {loading ? "Please wait…" : (<>{mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="ml-2 h-4 w-4" /></>)}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? (
                  <>New to MediScribe?{" "}
                    <button onClick={() => setMode("signup")} className="text-foreground hover:underline">Create an account</button>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <button onClick={() => setMode("signin")} className="text-foreground hover:underline">Sign in</button>
                  </>
                )}
              </div>
              <div className="mt-3 text-center text-xs text-muted-foreground">
                <Link to="/" className="hover:underline">← Back to home</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
