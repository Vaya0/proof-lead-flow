import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { INDUSTRIES, STAGES, stageBadgeClass } from "@/lib/constants";
import { ArrowRight, Check, TrendingUp, Users, DollarSign, Star } from "lucide-react";
import { toast } from "sonner";
import { StartupLogo } from "@/components/StartupLogo";
import { StartupActionsMenu } from "@/components/StartupActionsMenu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/investor")({
  component: InvestorDashboard,
});

type Startup = {
  id: string; startup_name: string; tagline: string; industry: string; business_model: string;
  stage: string; mrr: number; growth_rate: number; team_size: number;
  logo_url: string | null;
};

function InvestorDashboard() {
  const navigate = useNavigate();
  const [investorId, setInvestorId] = useState<string>("");
  const [startups, setStartups] = useState<Startup[]>([]);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [confirmTarget, setConfirmTarget] = useState<Startup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<"mrr-desc" | "mrr-asc" | "growth-desc" | "newest">("growth-desc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/auth" }); return; }
      const userId = sess.session.user.id;
      setInvestorId(userId);

      const { data: prof } = await supabase.from("investor_profiles").select("preferred_industries,target_stages").eq("user_id", userId).maybeSingle();
      if (!prof) { navigate({ to: "/onboarding/investor" }); return; }

      const [{ data: s }, { data: intros }, { data: favs }] = await Promise.all([
        supabase.from("startup_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("intro_requests").select("startup_id").eq("investor_id", userId),
        (supabase as any).from("investor_favorites").select("startup_id").eq("investor_id", userId),
      ]);
      setStartups((s ?? []) as Startup[]);
      setRequested(new Set((intros ?? []).map((i: any) => i.startup_id)));
      setFavorites(new Set((favs ?? []).map((f: any) => f.startup_id)));
      setIndustryFilter(prof.preferred_industries ?? []);
      setStageFilter(prof.target_stages ?? []);
      setLoading(false);
    })();
  }, [navigate]);

  const filtered = useMemo(() => {
    let out = startups;
    if (industryFilter.length) out = out.filter((s) => industryFilter.includes(s.industry));
    if (stageFilter.length) out = out.filter((s) => stageFilter.includes(s.stage));
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "mrr-desc": return b.mrr - a.mrr;
        case "mrr-asc": return a.mrr - b.mrr;
        case "growth-desc": return b.growth_rate - a.growth_rate;
        default: return 0;
      }
    });
    return out;
  }, [startups, industryFilter, stageFilter, sort]);

  const confirmIntro = async () => {
    if (!confirmTarget) return;
    setSubmitting(true);
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) { setSubmitting(false); return; }
    const { error } = await supabase.from("intro_requests").insert({
      investor_id: sess.session.user.id, startup_id: confirmTarget.id,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setRequested((s) => new Set(s).add(confirmTarget.id));
    toast.success("Intro requested");
    setConfirmTarget(null);
  };

  const toggleFavorite = async (startupId: string) => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return;
    const isFav = favorites.has(startupId);
    if (isFav) {
      const { error } = await (supabase as any)
        .from("investor_favorites").delete()
        .eq("investor_id", sess.session.user.id).eq("startup_id", startupId);
      if (error) { toast.error(error.message); return; }
      setFavorites((s) => { const n = new Set(s); n.delete(startupId); return n; });
    } else {
      const { error } = await (supabase as any)
        .from("investor_favorites").insert({ investor_id: sess.session.user.id, startup_id: startupId });
      if (error) { toast.error(error.message); return; }
      setFavorites((s) => new Set(s).add(startupId));
      toast.success("Added to favourites");
    }
  };

  const togglePill = (val: string, list: string[], set: (v: string[]) => void) => {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  return (
    <AppShell role="investor">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Matches</h1>
          <p className="text-muted-foreground mt-1">Startups filtered by your thesis</p>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-xl bg-card border border-border mb-6 space-y-3" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono text-muted-foreground uppercase mr-1">Industry</span>
            {INDUSTRIES.map((i) => (
              <button key={i} onClick={() => togglePill(i, industryFilter, setIndustryFilter)}
                className={`px-2.5 py-1 rounded-full text-xs border transition ${industryFilter.includes(i) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>
                {i}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono text-muted-foreground uppercase mr-1">Stage</span>
            {STAGES.map((i) => (
              <button key={i} onClick={() => togglePill(i, stageFilter, setStageFilter)}
                className={`px-2.5 py-1 rounded-full text-xs border transition ${stageFilter.includes(i) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>
                {i}
              </button>
            ))}
            <div className="ml-auto">
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground">
                <option value="growth-desc">Sort: Growth ↓</option>
                <option value="mrr-desc">Sort: MRR ↓</option>
                <option value="mrr-asc">Sort: MRR ↑</option>
                <option value="newest">Sort: Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-xl bg-card border border-border text-center text-muted-foreground">No startups match your filters yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((s) => (
              <article key={s.id} className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-start gap-3 mb-4">
                  <StartupLogo name={s.startup_name} url={s.logo_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <Link to="/startup/$id" params={{ id: s.id }} className="font-semibold text-lg hover:text-primary transition truncate">
                        {s.startup_name}
                      </Link>
                      <span className={`px-2 py-0.5 rounded-full text-xs border font-mono shrink-0 ${stageBadgeClass(s.stage)}`}>{s.stage}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.tagline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-border">
                  <Metric icon={<DollarSign className="w-3 h-3" />} label="MRR" value={`$${s.mrr.toLocaleString()}`} />
                  <Metric icon={<TrendingUp className="w-3 h-3" />} label="Growth" value={`${s.growth_rate}%`} />
                  <Metric icon={<Users className="w-3 h-3" />} label="Team" value={String(s.team_size)} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground border border-border">{s.industry}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground border border-border">{s.business_model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {investorId && (
                      <StartupActionsMenu startupId={s.id} investorId={investorId} />
                    )}
                    <button
                      onClick={() => toggleFavorite(s.id)}
                      aria-label={favorites.has(s.id) ? "Remove from favourites" : "Add to favourites"}
                      className={`p-1.5 rounded-lg border transition ${favorites.has(s.id) ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      <Star className={`w-4 h-4 ${favorites.has(s.id) ? "fill-current" : ""}`} />
                    </button>
                    {requested.has(s.id) ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400 px-3 py-1.5">
                        <Check className="w-3.5 h-3.5" /> Requested
                      </span>
                    ) : (
                      <button onClick={() => setConfirmTarget(s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
                        Request Intro <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!confirmTarget} onOpenChange={(o) => !o && setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request an intro?</DialogTitle>
            <DialogDescription>
              Do you want to request an intro for <span className="text-foreground font-medium">{confirmTarget?.startup_name}</span>?
              The founder will be notified and can accept or decline.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmTarget(null)}
              className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmIntro}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? "Sending…" : <>Yes, request intro <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">{icon}{label}</div>
      <div className="font-mono font-semibold text-foreground">{value}</div>
    </div>
  );
}
