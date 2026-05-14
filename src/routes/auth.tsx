import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Rocket } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"founder" | "investor">("founder");
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) routeAfterAuth(data.session.user.id);
    });
  }, []);

  const routeAfterAuth = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    const r = data?.role ?? role;
    const { data: hasStartup } = await supabase.from("startup_profiles").select("id").eq("user_id", userId).maybeSingle();
    const { data: hasInvestor } = await supabase.from("investor_profiles").select("id").eq("user_id", userId).maybeSingle();
    if (r === "founder") {
      navigate({ to: hasStartup ? "/dashboard/founder" : "/onboarding/founder" });
    } else {
      navigate({ to: hasInvestor ? "/dashboard/investor" : "/onboarding/investor" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { role, full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created");
          await routeAfterAuth(data.user!.id);
        } else {
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        await routeAfterAuth(data.user.id);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Rocket className="w-4 h-4 text-primary-foreground" />
          </div>
          UpStart
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-center">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="text-muted-foreground text-center mb-8">{mode === "signup" ? "Pick your side. Start with signal." : "Log in to continue."}</p>

          {/* Role tabs */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-card border border-border mb-6">
            {(["founder", "investor"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition ${
                  role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl bg-card border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
            {mode === "signup" && (
              <Field label="Full name" value={fullName} onChange={setFullName} required />
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "..." : mode === "signup" ? "Create account" : "Log in"}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition"
            >
              {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", ...rest }: any) {
  return (
    <label className="block">
      <span className="block text-sm text-muted-foreground mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
        {...rest}
      />
    </label>
  );
}
