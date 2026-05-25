import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bookmark, Tag, Plus, X } from "lucide-react";

type ListRow = { id: string; name: string };
type Label = { id: string; label: string; color: string };

const COLORS = ["blue", "emerald", "rose", "amber", "violet"];
export const labelColorClass = (c: string) =>
  ({
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  } as any)[c] ?? "bg-secondary text-muted-foreground border-border";

export function StartupActionsMenu({ startupId, investorId, onChange }: { startupId: string; investorId: string; onChange?: () => void }) {
  const [open, setOpen] = useState<"none" | "list" | "label">("none");
  const [lists, setLists] = useState<ListRow[]>([]);
  const [memberOf, setMemberOf] = useState<Set<string>>(new Set());
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("blue");

  useEffect(() => {
    if (open === "none") return;
    (async () => {
      const [{ data: ls }, { data: items }, { data: lbs }] = await Promise.all([
        (supabase as any).from("investor_lists").select("id,name").eq("investor_id", investorId).order("created_at"),
        (supabase as any).from("investor_list_items").select("list_id").eq("startup_id", startupId),
        (supabase as any).from("startup_labels").select("*").eq("investor_id", investorId).eq("startup_id", startupId),
      ]);
      setLists((ls ?? []) as ListRow[]);
      setMemberOf(new Set((items ?? []).filter((i: any) => (ls ?? []).some((l: any) => l.id === i.list_id)).map((i: any) => i.list_id)));
      setLabels((lbs ?? []) as Label[]);
    })();
  }, [open, investorId, startupId]);

  const toggleList = async (listId: string) => {
    if (memberOf.has(listId)) {
      await (supabase as any).from("investor_list_items").delete().eq("list_id", listId).eq("startup_id", startupId);
    } else {
      const { error } = await (supabase as any).from("investor_list_items").insert({ list_id: listId, startup_id: startupId });
      if (error) { toast.error(error.message); return; }
    }
    const next = new Set(memberOf);
    if (next.has(listId)) next.delete(listId); else next.add(listId);
    setMemberOf(next);
    onChange?.();
  };

  const addLabel = async () => {
    if (!newLabel.trim()) return;
    const { data, error } = await (supabase as any)
      .from("startup_labels")
      .insert({ investor_id: investorId, startup_id: startupId, label: newLabel.trim(), color: newLabelColor })
      .select().single();
    if (error) { toast.error(error.message); return; }
    setLabels([...labels, data]);
    setNewLabel("");
    onChange?.();
  };

  const removeLabel = async (id: string) => {
    await (supabase as any).from("startup_labels").delete().eq("id", id);
    setLabels(labels.filter((l) => l.id !== id));
    onChange?.();
  };

  return (
    <div className="relative inline-flex gap-1">
      <button onClick={() => setOpen(open === "list" ? "none" : "list")} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary" title="Add to list">
        <Bookmark className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => setOpen(open === "label" ? "none" : "label")} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary" title="Labels">
        <Tag className="w-3.5 h-3.5" />
      </button>
      {open !== "none" && (
        <div className="absolute right-0 top-full mt-1 z-30 w-64 p-3 rounded-xl bg-popover border border-border shadow-lg">
          {open === "list" ? (
            <>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-2">Add to list</div>
              {lists.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No lists yet. Create one in My Lists.</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-auto">
                  {lists.map((l) => (
                    <label key={l.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary cursor-pointer text-sm">
                      <input type="checkbox" checked={memberOf.has(l.id)} onChange={() => toggleList(l.id)} />
                      {l.name}
                    </label>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-2">Labels</div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {labels.map((l) => (
                  <span key={l.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${labelColorClass(l.color)}`}>
                    {l.label}
                    <button onClick={() => removeLabel(l.id)} className="hover:text-foreground"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
                {labels.length === 0 && <span className="text-xs text-muted-foreground">No labels yet</span>}
              </div>
              <div className="flex gap-1">
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLabel()}
                  placeholder="e.g. Hot Lead" className="flex-1 px-2 py-1.5 rounded-md bg-secondary border border-border text-xs" />
                <select value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} className="px-1 py-1.5 rounded-md bg-secondary border border-border text-xs">
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={addLabel} className="px-2 rounded-md bg-primary text-primary-foreground"><Plus className="w-3 h-3" /></button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}