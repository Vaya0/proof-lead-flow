import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Plus, Trash2, Pencil, ListChecks, X } from "lucide-react";
import { StartupLogo } from "@/components/StartupLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/lists")({
  component: ListsPage,
});

type ListRow = { id: string; name: string; color: string };
type ItemRow = { id: string; list_id: string; startup_id: string; startup?: any };

const LIST_COLORS = ["blue", "emerald", "rose", "amber", "violet", "cyan"];
const colorClass = (c: string) =>
  ({
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  } as any)[c] ?? "bg-secondary text-muted-foreground border-border";

function ListsPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ListRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) { navigate({ to: "/auth" }); return; }
    const uid = sess.session.user.id;
    const { data: ls } = await (supabase as any).from("investor_lists").select("*").eq("investor_id", uid).order("created_at");
    const list = (ls ?? []) as ListRow[];
    setLists(list);
    if (list.length && !activeId) setActiveId(list[0].id);
    const ids = list.map((l) => l.id);
    if (ids.length) {
      const { data: its } = await (supabase as any).from("investor_list_items").select("*").in("list_id", ids);
      const startupIds = Array.from(new Set((its ?? []).map((i: any) => i.startup_id))) as string[];
      const { data: startups } = startupIds.length
        ? await supabase.from("startup_profiles").select("*").in("id", startupIds)
        : { data: [] as any[] };
      const map = new Map((startups ?? []).map((s: any) => [s.id, s]));
      setItems((its ?? []).map((i: any) => ({ ...i, startup: map.get(i.startup_id) })));
    } else setItems([]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const createList = async () => {
    if (!newName.trim()) return;
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return;
    const { data, error } = await (supabase as any)
      .from("investor_lists")
      .insert({ investor_id: sess.session.user.id, name: newName.trim(), color: LIST_COLORS[lists.length % LIST_COLORS.length] })
      .select().single();
    if (error) { toast.error(error.message); return; }
    setNewName("");
    setActiveId(data.id);
    load();
  };

  const rename = async (id: string) => {
    if (!renameVal.trim()) { setRenameId(null); return; }
    const { error } = await (supabase as any).from("investor_lists").update({ name: renameVal.trim() }).eq("id", id);
    if (error) toast.error(error.message);
    setRenameId(null);
    load();
  };

  const removeList = async (id: string) => {
    if (!confirm("Delete this list?")) return;
    const { error } = await (supabase as any).from("investor_lists").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (activeId === id) setActiveId(null);
    load();
  };

  const removeItem = async (id: string) => {
    const { error } = await (supabase as any).from("investor_list_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const moveItem = async (item: ItemRow, targetListId: string) => {
    if (targetListId === item.list_id) return;
    const { error } = await (supabase as any).from("investor_list_items").update({ list_id: targetListId }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const active = lists.find((l) => l.id === activeId);
  const activeItems = items.filter((i) => i.list_id === activeId);

  return (
    <AppShell role="investor">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2"><ListChecks className="w-7 h-7" /> My Lists</h1>
          <p className="text-muted-foreground mt-1">Organize startups into custom buckets.</p>
        </div>

        {loading ? <div className="text-muted-foreground">Loading…</div> : (
          <div className="grid md:grid-cols-[280px_1fr] gap-6">
            <div className="space-y-2">
              <div className="flex gap-2">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createList()}
                  placeholder="New list…" className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
                <button onClick={createList} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground"><Plus className="w-4 h-4" /></button>
              </div>
              {lists.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No lists yet. Create one above.</p>}
              {lists.map((l) => (
                <div key={l.id} className={`group flex items-center gap-2 p-3 rounded-lg border transition cursor-pointer ${activeId === l.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`} onClick={() => setActiveId(l.id)}>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border font-mono ${colorClass(l.color)}`}>{items.filter((i) => i.list_id === l.id).length}</span>
                  {renameId === l.id ? (
                    <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onBlur={() => rename(l.id)} onKeyDown={(e) => e.key === "Enter" && rename(l.id)}
                      className="flex-1 bg-transparent border-b border-border text-sm focus:outline-none" />
                  ) : (
                    <span className="flex-1 text-sm font-medium truncate">{l.name}</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setRenameId(l.id); setRenameVal(l.name); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); removeList(l.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>

            <div>
              {!active ? (
                <div className="p-12 rounded-xl bg-card border border-border text-center text-muted-foreground">Select a list to view its startups.</div>
              ) : activeItems.length === 0 ? (
                <div className="p-12 rounded-xl bg-card border border-border text-center text-muted-foreground">
                  <p className="mb-4">"{active.name}" is empty.</p>
                  <Link to="/dashboard/investor" className="text-primary hover:underline text-sm">Browse startups →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeItems.map((it) => (
                    <div key={it.id} className="p-4 rounded-xl bg-card border border-border flex items-center gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
                      <StartupLogo name={it.startup?.startup_name ?? "—"} url={it.startup?.logo_url} size="md" />
                      <div className="flex-1 min-w-0">
                        <Link to="/startup/$id" params={{ id: it.startup_id }} className="font-semibold hover:text-primary">{it.startup?.startup_name ?? "Unknown"}</Link>
                        <p className="text-sm text-muted-foreground truncate">{it.startup?.tagline}</p>
                      </div>
                      <select value={it.list_id} onChange={(e) => moveItem(it, e.target.value)} className="text-xs px-2 py-1.5 rounded-lg bg-secondary border border-border">
                        {lists.map((l) => <option key={l.id} value={l.id}>Move: {l.name}</option>)}
                      </select>
                      <button onClick={() => removeItem(it.id)} className="p-2 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}