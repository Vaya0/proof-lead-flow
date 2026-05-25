import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { THEMES, useTheme, ThemeName } from "@/lib/theme";
import { Check } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState<"founder" | "investor">("founder");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/auth" }); return; }
      const { data: p } = await supabase.from("profiles").select("role").eq("id", sess.session.user.id).maybeSingle();
      if (p?.role) setRole(p.role as any);
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) return <AppShell role={role}><div className="p-10 text-muted-foreground">Loading…</div></AppShell>;

  return (
    <AppShell role={role}>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Personalize your UpStart experience.</p>

        <section className="p-6 rounded-xl bg-card border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="text-lg font-semibold mb-1">Theme</h2>
          <p className="text-sm text-muted-foreground mb-5">Choose your color palette. Saved to your account.</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeName)}
                  className={`relative p-4 rounded-xl border transition text-left ${active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}
                >
                  <div className="w-full h-12 rounded-lg mb-3" style={{ background: t.swatch }} />
                  <div className="text-sm font-medium">{t.label}</div>
                  {active && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}