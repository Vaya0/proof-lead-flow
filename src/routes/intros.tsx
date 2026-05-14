import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/intros")({
  component: Intros,
});

function Intros() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"founder" | "investor">("founder");
  const [intros, setIntros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/auth" }); return; }
      const userId = sess.session.user.id;
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      const r = (prof?.role ?? "founder") as "founder" | "investor";
      setRole(r);

      let q = supabase.from("intro_requests").select("*, startup:startup_profiles(startup_name, tagline, stage)").order("created_at", { ascending: false });
      if (r === "investor") q = q.eq("investor_id", userId);
      const { data } = await q;
      setIntros(data ?? []);
      setLoading(false);
    })();
  }, [navigate]);

  const update = async (id: string, status: "accepted" | "declined") => {
    const { error } = await supabase.from("intro_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setIntros((xs) => xs.map((x) => x.id === id ? { ...x, status } : x));
    toast.success(`Intro ${status}`);
  };

  return (
    <AppShell role={role}>
      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold mb-1">{role === "investor" ? "My Intros" : "Intro Requests"}</h1>
        <p className="text-muted-foreground mb-8">{role === "investor" ? "Track requests you've sent." : "Investors who want to talk."}</p>
        {loading ? <div className="text-muted-foreground">Loading…</div> :
         intros.length === 0 ? <div className="p-10 rounded-xl bg-card border border-border text-center text-muted-foreground">Nothing here yet.</div> :
         <div className="space-y-3">
          {intros.map((i) => (
            <div key={i.id} className="p-5 rounded-xl bg-card border border-border flex items-center justify-between gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="min-w-0">
                <div className="font-medium truncate">{i.startup?.startup_name ?? "Startup"}</div>
                <div className="text-sm text-muted-foreground truncate">{i.startup?.tagline}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">{new Date(i.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs border font-mono uppercase ${
                  i.status === "pending" ? "bg-secondary text-muted-foreground border-border" :
                  i.status === "accepted" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                  "bg-destructive/15 text-destructive border-destructive/30"
                }`}>{i.status}</span>
                {role === "founder" && i.status === "pending" && (
                  <>
                    <button onClick={() => update(i.id, "accepted")} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition">Accept</button>
                    <button onClick={() => update(i.id, "declined")} className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-secondary transition">Decline</button>
                  </>
                )}
              </div>
            </div>
          ))}
         </div>}
      </div>
    </AppShell>
  );
}
