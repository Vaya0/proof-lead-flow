import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { Plus, X, Upload, User } from "lucide-react";

type Member = { id: string; name: string; title: string; bio: string | null; linkedin_url: string | null; photo_url: string | null; sort_order: number };

export function TeamSection({ startupId, userId }: { startupId: string; userId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", title: "", bio: "", linkedin_url: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await (supabase as any).from("startup_team_members").select("*").eq("startup_id", startupId).order("sort_order");
    setMembers((data ?? []) as Member[]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [startupId]);

  const reset = () => { setForm({ name: "", title: "", bio: "", linkedin_url: "" }); setPhotoFile(null); setAdding(false); };

  const add = async () => {
    if (!form.name.trim() || !form.title.trim()) { toast.error("Name and title required"); return; }
    if (members.length >= 15) { toast.error("Max 15 members"); return; }
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (photoFile) {
        const { url } = await uploadFile({ bucket: "team-photos", userId, file: photoFile, maxBytes: 5 * 1024 * 1024 });
        photo_url = url;
      }
      const { error } = await (supabase as any).from("startup_team_members").insert({
        startup_id: startupId, name: form.name, title: form.title, bio: form.bio || null,
        linkedin_url: form.linkedin_url || null, photo_url, sort_order: members.length,
      });
      if (error) throw error;
      reset();
      load();
    } catch (e: any) { toast.error(e.message ?? "Failed to add"); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    await (supabase as any).from("startup_team_members").delete().eq("id", id);
    load();
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-border space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Key People ({members.length}/15)</h3>
        {!adding && members.length < 15 && (
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-secondary"><Plus className="w-3 h-3" /> Add</button>
        )}
      </div>

      {members.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {members.map((m) => (
            <div key={m.id} className="relative group text-center">
              <button onClick={() => remove(m.id)} className="absolute -top-1 -right-1 z-10 p-1 rounded-full bg-background border border-border opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center mb-2">
                {m.photo_url ? <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-muted-foreground" />}
              </div>
              <div className="text-xs font-medium truncate">{m.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{m.title}</div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="p-3 rounded-lg border border-border bg-secondary/50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input className="px-2 py-1.5 text-sm rounded-md bg-background border border-border" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="px-2 py-1.5 text-sm rounded-md bg-background border border-border" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <input className="w-full px-2 py-1.5 text-sm rounded-md bg-background border border-border" placeholder="LinkedIn URL (optional)" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
          <textarea className="w-full px-2 py-1.5 text-sm rounded-md bg-background border border-border" placeholder="Short bio (optional)" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <div className="flex items-center justify-between gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-background"><Upload className="w-3 h-3" /> {photoFile ? photoFile.name.slice(0, 20) : "Photo"}</button>
            <div className="flex gap-2">
              <button onClick={reset} className="text-xs px-2 py-1 text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={add} disabled={busy} className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}