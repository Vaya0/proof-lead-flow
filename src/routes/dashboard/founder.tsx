import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { stageBadgeClass } from "@/lib/constants";
import { TrendingUp, DollarSign, Users, Mail, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/dashboard/founder")({
  component: FounderDashboard,
});

function FounderDashboard() {
  const navigate = useNavigate();
  const [startup, setStartup] = useState<any>(null);
  const [intros, setIntros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/auth" }); return; }
      const userId = sess.session.user.id;
      const { data: s } = await supabase.from("startup_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (!s) { navigate({ to: "/onboarding/founder" }); return; }
      setStartup(s);
      const { data: i } = await supabase.from("intro_requests").select("*").eq("startup_id", s.id).order("created_at", { ascending: false });
      setIntros(i ?? []);
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) return <AppShell role="founder"><div className="p-10 text-muted-foreground">Loading…</div></AppShell>;

  return (
    <AppShell role="founder">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{startup.startup_name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs border font-mono ${stageBadgeClass(startup.stage)}`}>{startup.stage}</span>
            </div>
            <p className="text-muted-foreground">{startup.tagline}</p>
          </div>
          <a href={startup.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition">
            Demo <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Stat icon={<DollarSign className="w-4 h-4" />} label="MRR" value={`$${Number(startup.mrr).toLocaleString()}`} />
          <Stat icon={<TrendingUp className="w-4 h-4" />} label="Growth" value={`${startup.growth_rate}%`} />
          <Stat icon={<Users className="w-4 h-4" />} label="Users" value={Number(startup.total_users).toLocaleString()} />
          <Stat icon={<Mail className="w-4 h-4" />} label="Intros" value={String(intros.length)} accent />
        </div>

        <h2 className="text-xl font-semibold mb-4">Intro Requests</h2>
        {intros.length === 0 ? (
          <div className="p-12 rounded-xl bg-card border border-border text-center text-muted-foreground">
            No intro requests yet. Investors are reviewing your profile.
          </div>
        ) : (
          <div className="space-y-3">
            {intros.map((i) => (
              <div key={i.id} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between" style={{ boxShadow: "var(--shadow-card)" }}>
                <div>
                  <div className="font-medium">Investor request</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">{new Date(i.created_at).toLocaleString()}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs border font-mono uppercase ${
                  i.status === "pending" ? "bg-secondary text-muted-foreground border-border" :
                  i.status === "accepted" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                  "bg-destructive/15 text-destructive border-destructive/30"
                }`}>{i.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-5 rounded-xl bg-card border ${accent ? "border-primary/40" : "border-border"}`} style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">{icon}{label}</div>
      <div className={`font-mono font-semibold text-2xl ${accent ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
