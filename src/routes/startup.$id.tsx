import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { stageBadgeClass } from "@/lib/constants";
import { ArrowLeft, ExternalLink, TrendingUp, DollarSign, Users, Briefcase } from "lucide-react";
import { StartupLogo } from "@/components/StartupLogo";
import { FileText, User } from "lucide-react";

export const Route = createFileRoute("/startup/$id")({
  component: StartupDetail,
});

function StartupDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/auth" }); return; }
      const { data } = await supabase.from("startup_profiles").select("*").eq("id", id).maybeSingle();
      setStartup(data);
      setLoading(false);
      if (data) {
        const [m, t, inv] = await Promise.all([
          (supabase as any).from("startup_media").select("*").eq("startup_id", data.id).order("sort_order"),
          (supabase as any).from("startup_team_members").select("*").eq("startup_id", data.id).order("sort_order"),
          (supabase as any).from("startup_existing_investors").select("*").eq("startup_id", data.id).order("created_at"),
        ]);
        setMedia(m.data ?? []);
        setTeam(t.data ?? []);
        setInvestors(inv.data ?? []);
      }
      // Track investor profile view (deduped per session via unique constraint).
      if (data && data.user_id !== sess.session.user.id) {
        let sessionKey = sessionStorage.getItem("upstart-view-session");
        if (!sessionKey) {
          sessionKey = crypto.randomUUID();
          sessionStorage.setItem("upstart-view-session", sessionKey);
        }
        await (supabase as any).from("startup_profile_views").insert({
          startup_id: data.id,
          investor_id: sess.session.user.id,
          session_key: sessionKey,
        });
      }
    })();
  }, [id, navigate]);

  return (
    <AppShell role="investor">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <Link to="/dashboard/investor" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to matches
        </Link>
        {loading ? <div className="text-muted-foreground">Loading…</div> : !startup ? (
          <div className="text-muted-foreground">Not found.</div>
        ) : (
          <>
            <div className="flex items-start gap-4 mb-6">
              <StartupLogo name={startup.startup_name} url={startup.logo_url} size="lg" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-3xl font-bold">{startup.startup_name}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-xs border font-mono ${stageBadgeClass(startup.stage)}`}>{startup.stage}</span>
                </div>
                <p className="text-muted-foreground text-lg">{startup.tagline}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-8">
              <span className="px-2.5 py-1 rounded-full text-xs bg-secondary border border-border text-muted-foreground">{startup.industry}</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-secondary border border-border text-muted-foreground">{startup.business_model}</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-secondary border border-border text-muted-foreground">{startup.hq_location}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Cell icon={<DollarSign className="w-3.5 h-3.5" />} label="MRR" value={`$${Number(startup.mrr).toLocaleString()}`} />
              <Cell icon={<TrendingUp className="w-3.5 h-3.5" />} label="Growth" value={`${startup.growth_rate}%`} />
              <Cell icon={<Users className="w-3.5 h-3.5" />} label="Users" value={Number(startup.total_users).toLocaleString()} />
              <Cell icon={<Briefcase className="w-3.5 h-3.5" />} label="Team" value={String(startup.team_size)} />
            </div>

            <Section title="Traction">
              <p className="text-foreground/90 leading-relaxed">{startup.traction_description}</p>
            </Section>

            <Section title="Raising">
              <div className="font-mono text-2xl mb-2">${Number(startup.raise_amount).toLocaleString()}</div>
              <p className="text-foreground/90 leading-relaxed">{startup.use_of_funds}</p>
            </Section>

            {startup.intro_video_url && (
              <Section title="Founder Intro">
                <video src={startup.intro_video_url} controls className="w-full rounded-lg border border-border" />
              </Section>
            )}

            {media.filter((m) => m.kind === "image").length > 0 && (
              <Section title="Product">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {media.filter((m) => m.kind === "image").map((m) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block aspect-video rounded-lg overflow-hidden border border-border">
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {media.filter((m) => m.kind === "pdf").length > 0 && (
              <Section title="Documents">
                <div className="space-y-2">
                  {media.filter((m) => m.kind === "pdf").map((m) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-secondary hover:bg-secondary/70 text-sm">
                      <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{m.title ?? "Document"}</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {team.length > 0 && (
              <Section title="Key People">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {team.map((m) => (
                    <div key={m.id} className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center mb-2">
                        {m.photo_url ? <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-muted-foreground" />}
                      </div>
                      <div className="text-xs font-medium truncate">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{m.title}</div>
                      {m.linkedin_url && (
                        <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline">LinkedIn</a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {investors.length > 0 && (
              <Section title="Existing Investors">
                <div className="space-y-2">
                  {investors.map((i) => (
                    <div key={i.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/40">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{i.name}</span>
                        {i.is_lead && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/15 text-primary border border-primary/30">LEAD</span>}
                        {i.round && <span className="text-xs text-muted-foreground">· {i.round}</span>}
                      </div>
                      {i.amount > 0 && <span className="text-xs font-mono text-muted-foreground">${Number(i.amount).toLocaleString()}</span>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Founder">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{startup.founder_name}</div>
                  <a href={startup.linkedin_url} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <a href={startup.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
                  Try the demo <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Cell({ icon, label, value }: any) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1.5">{icon}{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 p-6 rounded-xl bg-card border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
      <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      {children}
    </section>
  );
}
