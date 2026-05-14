import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StartupLogo } from "./StartupLogo";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export function LogoUploader({
  userId,
  name,
  value,
  onChange,
}: {
  userId: string;
  name: string;
  value?: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("startup-logos").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("startup-logos").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Logo uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <StartupLogo name={name} url={value} size="lg" />
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-secondary transition disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" /> {busy ? "Uploading…" : value ? "Replace" : "Upload logo"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-destructive transition"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
        <p className="text-xs text-muted-foreground">PNG, JPG, SVG · max 2MB</p>
      </div>
    </div>
  );
}
