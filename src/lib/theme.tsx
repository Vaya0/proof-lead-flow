import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ThemeName = "midnight" | "emerald" | "crimson" | "slate" | "light";

export const THEMES: { id: ThemeName; label: string; swatch: string }[] = [
  { id: "midnight", label: "Midnight", swatch: "#2563EB" },
  { id: "emerald", label: "Emerald", swatch: "#10B981" },
  { id: "crimson", label: "Crimson", swatch: "#EF4444" },
  { id: "slate", label: "Slate", swatch: "#94A3B8" },
  { id: "light", label: "Light", swatch: "#F1F5F9" },
];

const Ctx = createContext<{ theme: ThemeName; setTheme: (t: ThemeName) => void }>({
  theme: "midnight",
  setTheme: () => {},
});

const applyTheme = (t: ThemeName) => {
  if (typeof document === "undefined") return;
  if (t === "midnight") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "midnight";
    return (localStorage.getItem("upstart-theme") as ThemeName) || "midnight";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sync from DB on auth
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) return;
      const { data } = await (supabase as any)
        .from("user_settings")
        .select("theme")
        .eq("user_id", sess.session.user.id)
        .maybeSingle();
      if (mounted && data?.theme) {
        setThemeState(data.theme as ThemeName);
        localStorage.setItem("upstart-theme", data.theme);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("upstart-theme", t);
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) return;
      await (supabase as any)
        .from("user_settings")
        .upsert({ user_id: sess.session.user.id, theme: t, updated_at: new Date().toISOString() });
    })();
  };

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);