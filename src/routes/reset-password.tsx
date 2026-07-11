import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/mediscribe/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password — MediScribe" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase places a recovery access_token in the URL hash.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("type=recovery") || hash.includes("access_token")) setReady(true);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. Please sign in.");
      await supabase.auth.signOut();
      navigate({ to: "/login", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl animate-float" style={{ background: "var(--neon)" }} />
        <div className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl animate-float" style={{ background: "var(--emerald)", animationDelay: "1s" }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="glass-strong rounded-3xl p-8 md:p-10">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong password — at least 8 characters.
          </p>
          {!ready && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              Waiting for a valid recovery link… Please use the link from your email.
            </div>
          )}
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="pw">New password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl bg-card/60 pl-10" placeholder="••••••••" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf">Confirm password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="cf" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 rounded-xl bg-card/60 pl-10" placeholder="••••••••" />
              </div>
            </div>
            <Button type="submit" disabled={loading || !ready} className="h-11 w-full rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              {loading ? "Updating…" : (<>Update password <ArrowRight className="ml-2 h-4 w-4" /></>)}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
