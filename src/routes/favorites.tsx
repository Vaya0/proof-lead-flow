import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Star, ArrowRight } from "lucide-react";
import { StartupLogo } from "@/components/StartupLogo";
import { stageBadgeClass } from "@/lib/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) { navigate({ to: "/auth" }); return; }
    const { data: favs } = await (supabase as any)
      .from("investor_favorites")
      .select("startup_id, created_at")
      .eq("investor_id", sess.session.user.id)
      .order("created_at", { ascending: false });
    const ids = (favs ?? []).map((f: any) => f.startup_id);
    if (ids.length === 0) { setItems([]); setLoading(false); return; }
    const { data: startups } = await supabase
      .from("startup_profiles").select("*").in("id", ids);
    const byId = new Map((startups ?? []).map((s: any) => [s.id, s]));
    setItems((favs ?? []).map((f: any) => byId.get(f.startup_id)).filter(Boolean));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (startupId: string) => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return;
    const { error } = await (supabase as any)
      .from("investor_favorites")
      .delete()
      .eq("investor_id", sess.session.user.id)
      .eq("startup_id", startupId);
    if (error) { toast.error(error.message); return; }
    setItems((xs) => xs.filter((x) => x.id !== startupId));
    toast.success("Removed from favourites");
  };

  return (
    <AppShell role="investor">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8 flex items-center gap-2">
          <Star className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Favourites</h1>
        </div>
        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-12 rounded-xl bg-card border border-border text-center text-muted-foreground">
            No favourites yet. Star startups on the browse page to save them here.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((s) => (
              <article key={s.id} className="p-6 rounded-xl bg-card border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-start gap-3 mb-3">
                  <StartupLogo name={s.startup_name} url={s.logo_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link to="/startup/$id" params={{ id: s.id }} className="font-semibold text-lg hover:text-primary transition truncate">
                        {s.startup_name}
                      </Link>
                      <span className={`px-2 py-0.5 rounded-full text-xs border font-mono shrink-0 ${stageBadgeClass(s.stage)}`}>{s.stage}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{s.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <button onClick={() => remove(s.id)} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current" /> Remove
                  </button>
                  <Link to="/startup/$id" params={{ id: s.id }} className="inline-flex items-center gap-1.5 text-sm text-primary hover:opacity-80">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}