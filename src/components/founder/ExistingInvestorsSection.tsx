import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

type Inv = { id: string; name: string; amount: number; round: string | null; is_lead: boolean };

export function ExistingInvestorsSection({ startupId }: { startupId: string }) {
  const [items, setItems] = useState<Inv[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", round: "", is_lead: false });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await (supabase as any).from("startup_existing_investors").select("*").eq("startup_id", startupId).order("created_at");
    setItems((data ?? []) as Inv[]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [startupId]);

  const reset = () => { setForm({ name: "", amount: "", round: "", is_lead: false }); setAdding(false); };

  const add = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setBusy(true);
    try {
      const { error } = await (supabase as any).from("startup_existing_investors").insert({
        startup_id: startupId, name: form.name, amount: Number(form.amount) || 0,
        round: form.round || null, is_lead: form.is_lead,
      });
      if (error) throw error;
      reset();
      load();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    await (supabase as any).from("startup_existing_investors").delete().eq("id", id);
    load();
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-border space-y-3" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Existing Investors</h3>
        {!adding && (
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-secondary"><Plus className="w-3 h-3" /> Add</button>
        )}
      </div>

      {items.length === 0 && !adding && <div className="text-sm text-muted-foreground">No investors added.</div>}

      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/40">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{i.name}</span>
              {i.is_lead && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/15 text-primary border border-primary/30">LEAD</span>}
              {i.round && <span className="text-xs text-muted-foreground">· {i.round}</span>}
              {i.amount > 0 && <span className="text-xs font-mono text-muted-foreground">· ${Number(i.amount).toLocaleString()}</span>}
            </div>
            <button onClick={() => remove(i.id)} className="p-1 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>

      {adding && (
        <div className="p-3 rounded-lg border border-border bg-secondary/50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input className="px-2 py-1.5 text-sm rounded-md bg-background border border-border" placeholder="Investor name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="px-2 py-1.5 text-sm rounded-md bg-background border border-border" placeholder="Round (e.g. Seed)" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} />
          </div>
          <input type="number" className="w-full px-2 py-1.5 text-sm rounded-md bg-background border border-border" placeholder="Amount (USD)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_lead} onChange={(e) => setForm({ ...form, is_lead: e.target.checked })} />
            Lead investor
          </label>
          <div className="flex justify-end gap-2">
            <button onClick={reset} className="text-xs px-2 py-1 text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={add} disabled={busy} className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
          </div>
        </div>
      )}
    </div>
  );
}