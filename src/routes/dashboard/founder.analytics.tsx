import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { BarChart3, Eye, Users, Mail, CheckCircle2, DollarSign, TrendingUp, Flame, Clock, Users2, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard/founder/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ views: 0, unique: 0, intros: 0, accepted: 0 });
  const [viewSeries, setViewSeries] = useState<any[]>([]);
  const [introSeries, setIntroSeries] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [startup, setStartup] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/auth" }); return; }
      const { data: startup } = await supabase.from("startup_profiles").select("id,startup_name").eq("user_id", sess.session.user.id).maybeSingle();
      if (!startup) { navigate({ to: "/onboarding/founder" }); return; }
      const { data: full } = await supabase.from("startup_profiles").select("*").eq("id", startup.id).maybeSingle();
      setStartup(full);

      const [{ data: views }, { data: intros }] = await Promise.all([
        (supabase as any).from("startup_profile_views").select("*").eq("startup_id", startup.id).order("viewed_at", { ascending: false }),
        supabase.from("intro_requests").select("*").eq("startup_id", startup.id).order("created_at", { ascending: false }),
      ]);

      const uniqueInvestors = new Set((views ?? []).map((v: any) => v.investor_id)).size;
      const accepted = (intros ?? []).filter((i: any) => i.status === "accepted").length;

      const investorIds = Array.from(new Set([
        ...(views ?? []).map((v: any) => v.investor_id),
        ...(intros ?? []).map((i: any) => i.investor_id),
      ])) as string[];
      const { data: profs } = investorIds.length
        ? await supabase.from("profiles").select("id,full_name").in("id", investorIds)
        : { data: [] as any[] };
      const nameMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name || "An investor"]));

      const bucket = (rows: any[], dateKey: string) => {
        const m = new Map<string, number>();
        rows.forEach((r) => {
          const d = new Date(r[dateKey]).toISOString().slice(0, 10);
          m.set(d, (m.get(d) ?? 0) + 1);
        });
        return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count }));
      };

      setStats({ views: (views ?? []).length, unique: uniqueInvestors, intros: (intros ?? []).length, accepted });
      setViewSeries(bucket(views ?? [], "viewed_at"));
      setIntroSeries(bucket(intros ?? [], "created_at"));

      const feed = [
        ...(views ?? []).map((v: any) => ({ kind: "view", at: v.viewed_at, who: nameMap.get(v.investor_id) ?? "An investor" })),
        ...(intros ?? []).map((i: any) => ({ kind: "intro", at: i.created_at, who: nameMap.get(i.investor_id) ?? "An investor", status: i.status })),
      ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 20);
      setActivity(feed);
      setLoading(false);
    })();
  }, [navigate]);

  
  const fmtMoney = (v: any) => v == null ? "—" : `$${Number(v).toLocaleString()}`;
  const fmtNum = (v: any) => v == null ? "—" : Number(v).toLocaleString();
  const fmtPct = (v: any) => v == null ? "—" : `${Number(v)}%`;

  return (
    <AppShell role="founder">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2"><BarChart3 className="w-7 h-7" /> Analytics</h1>
        <p className="text-muted-foreground mb-8">Your startup's traction metrics and how investors are engaging with your profile.</p>

        {loading ? <div className="text-muted-foreground">Loading…</div> : (
          <>
            <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Traction metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Kpi icon={<DollarSign className="w-4 h-4" />} label="MRR" value={fmtMoney(startup?.mrr)} accent />
              <Kpi icon={<DollarSign className="w-4 h-4" />} label="Annual Revenue" value={fmtMoney(startup?.annual_revenue)} />
              <Kpi icon={<TrendingUp className="w-4 h-4" />} label="Growth Rate" value={fmtPct(startup?.growth_rate)} />
              <Kpi icon={<Users2 className="w-4 h-4" />} label="Total Users" value={fmtNum(startup?.total_users)} />
              <Kpi icon={<Flame className="w-4 h-4" />} label="Monthly Burn" value={fmtMoney(startup?.monthly_burn)} />
              <Kpi icon={<Clock className="w-4 h-4" />} label="Runway" value={startup?.runway_months ? `${startup.runway_months} mo` : "—"} />
              <Kpi icon={<Users className="w-4 h-4" />} label="Team Size" value={fmtNum(startup?.team_size)} />
              <Kpi icon={<Target className="w-4 h-4" />} label="Raising" value={fmtMoney(startup?.raise_amount)} />
            </div>
            {startup?.traction_description && (
              <div className="mb-8 p-4 rounded-xl bg-card border border-border text-sm" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Traction narrative</div>
                {startup.traction_description}
              </div>
            )}

            <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3 mt-8">Investor engagement</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Kpi icon={<Eye className="w-4 h-4" />} label="Profile Views" value={stats.views} />
              <Kpi icon={<Users className="w-4 h-4" />} label="Unique Investors" value={stats.unique} />
              <Kpi icon={<Mail className="w-4 h-4" />} label="Intro Requests" value={stats.intros} />
              <Kpi icon={<CheckCircle2 className="w-4 h-4" />} label="Accepted" value={stats.accepted} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Chart title="Profile views over time" data={viewSeries} />
              <Chart title="Intro requests over time" data={introSeries} />
            </div>

            <section className="p-6 rounded-xl bg-card border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-semibold mb-4">Recent activity</h2>
              {activity.length === 0 ? (
                <p className="text-muted-foreground text-sm">No activity yet. Investors will show up here as they engage.</p>
              ) : (
                <ul className="space-y-2">
                  {activity.map((a, i) => (
                    <li key={i} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                      <span>
                        <span className="font-medium">{a.who}</span>{" "}
                        {a.kind === "view" ? "viewed your startup" : `requested an intro (${a.status})`}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{new Date(a.at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: any; accent?: boolean }) {
  const str = String(value ?? "");
  const sizeClass = str.length > 14 ? "text-sm" : str.length > 10 ? "text-base" : str.length > 7 ? "text-lg" : "text-2xl";
  return (
    <div className={`p-4 rounded-xl bg-card border ${accent ? "border-primary/40" : "border-border"} min-w-0`} style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-2">{icon}{label}</div>
      <div className={`font-mono font-semibold ${sizeClass} ${accent ? "text-primary" : ""} truncate`} title={str}>{value}</div>
    </div>
  );
}

function Chart({ title, data }: { title: string; data: any[] }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}