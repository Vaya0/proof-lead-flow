import { supabase } from "@/integrations/supabase/client";

export type UploadOpts = {
  bucket: "startup-media" | "team-photos" | "revenue-proofs" | "startup-logos";
  userId: string;
  file: File;
  subPath?: string; // appended after userId/
  maxBytes?: number;
};

export async function uploadFile({ bucket, userId, file, subPath = "", maxBytes }: UploadOpts) {
  if (maxBytes && file.size > maxBytes) {
    throw new Error(`File too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`);
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = subPath ? `${userId}/${subPath}/${safe}` : `${userId}/${safe}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(v.duration);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Cannot read video metadata"));
    };
    v.src = url;
  });
}