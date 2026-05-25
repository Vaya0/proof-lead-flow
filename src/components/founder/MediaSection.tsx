import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, getVideoDuration } from "@/lib/upload";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, FileText, Video } from "lucide-react";

type Media = { id: string; kind: "image" | "pdf" | "video"; url: string; title: string | null };

export function MediaSection({ startupId, userId, introVideoUrl, onIntroVideo }: {
  startupId: string; userId: string; introVideoUrl: string | null; onIntroVideo: (url: string | null) => void;
}) {
  const [media, setMedia] = useState<Media[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await (supabase as any).from("startup_media").select("*").eq("startup_id", startupId).order("sort_order");
    setMedia((data ?? []) as Media[]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [startupId]);

  const images = media.filter((m) => m.kind === "image");
  const pdfs = media.filter((m) => m.kind === "pdf");

  const handleVideo = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) { toast.error("Max 100MB"); return; }
    if (!/^video\/(mp4|quicktime|webm)$/.test(file.type) && !/\.(mp4|mov|webm)$/i.test(file.name)) {
      toast.error("Only mp4, mov, webm");
      return;
    }
    setBusy("video");
    try {
      const dur = await getVideoDuration(file).catch(() => 0);
      if (dur && dur > 180) { toast.error(`Video is ${Math.round(dur)}s. Max 3 minutes.`); return; }
      const { url } = await uploadFile({ bucket: "startup-media", userId, file, subPath: "video", maxBytes: 100 * 1024 * 1024 });
      const { error } = await supabase.from("startup_profiles").update({ intro_video_url: url } as any).eq("id", startupId);
      if (error) throw error;
      onIntroVideo(url);
      toast.success("Video uploaded");
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    finally { setBusy(null); }
  };

  const handleImage = async (file: File) => {
    if (images.length >= 8) { toast.error("Max 8 images"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB per image"); return; }
    setBusy("image");
    try {
      const { url } = await uploadFile({ bucket: "startup-media", userId, file, subPath: "images" });
      const { error } = await (supabase as any).from("startup_media").insert({ startup_id: startupId, kind: "image", url, sort_order: images.length });
      if (error) throw error;
      load();
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    finally { setBusy(null); }
  };

  const handlePdf = async (file: File) => {
    if (pdfs.length >= 3) { toast.error("Max 3 PDFs"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB per PDF"); return; }
    setBusy("pdf");
    try {
      const { url } = await uploadFile({ bucket: "startup-media", userId, file, subPath: "docs" });
      const { error } = await (supabase as any).from("startup_media").insert({ startup_id: startupId, kind: "pdf", url, title: file.name, sort_order: pdfs.length });
      if (error) throw error;
      load();
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    finally { setBusy(null); }
  };

  const removeMedia = async (id: string) => {
    await (supabase as any).from("startup_media").delete().eq("id", id);
    load();
  };

  const removeVideo = async () => {
    await supabase.from("startup_profiles").update({ intro_video_url: null } as any).eq("id", startupId);
    onIntroVideo(null);
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-border space-y-6" style={{ boxShadow: "var(--shadow-card)" }}>
      <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Product Media</h3>

      {/* Intro video */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium mb-2"><Video className="w-4 h-4" /> Founder Intro Video <span className="text-xs text-muted-foreground">(≤ 3 min)</span></div>
        {introVideoUrl ? (
          <div className="space-y-2">
            <video src={introVideoUrl} controls className="w-full max-w-md rounded-lg border border-border" />
            <button onClick={removeVideo} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"><X className="w-3 h-3" /> Remove video</button>
          </div>
        ) : (
          <>
            <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideo(f); e.target.value = ""; }} />
            <button onClick={() => videoRef.current?.click()} disabled={busy === "video"} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary disabled:opacity-50">
              <Upload className="w-3.5 h-3.5" /> {busy === "video" ? "Uploading…" : "Upload video"}
            </button>
          </>
        )}
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium"><ImageIcon className="w-4 h-4" /> Images <span className="text-xs text-muted-foreground">({images.length}/8)</span></div>
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ""; }} />
          <button disabled={images.length >= 8 || busy === "image"} onClick={() => imageRef.current?.click()} className="text-xs px-2 py-1 rounded-md border border-border hover:bg-secondary disabled:opacity-50">+ Add</button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeMedia(img.id)} className="absolute top-1 right-1 p-1 rounded-md bg-background/80 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* PDFs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium"><FileText className="w-4 h-4" /> Documents <span className="text-xs text-muted-foreground">({pdfs.length}/3)</span></div>
          <input ref={pdfRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdf(f); e.target.value = ""; }} />
          <button disabled={pdfs.length >= 3 || busy === "pdf"} onClick={() => pdfRef.current?.click()} className="text-xs px-2 py-1 rounded-md border border-border hover:bg-secondary disabled:opacity-50">+ Add</button>
        </div>
        <div className="space-y-1.5">
          {pdfs.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2 rounded-md border border-border bg-secondary">
              <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-foreground hover:text-primary truncate">
                <FileText className="w-4 h-4 shrink-0" /> <span className="truncate">{p.title ?? "Document"}</span>
              </a>
              <button onClick={() => removeMedia(p.id)} className="p-1 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}