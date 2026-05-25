import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Rocket, LogOut, LayoutDashboard, Search, Mail, FileText, GraduationCap, ListChecks, BarChart3, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ReactNode } from "react";

export function AppShell({ role, children }: { role: "founder" | "investor"; children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const items = role === "investor"
    ? [
        { to: "/dashboard/investor", label: "Browse Startups", icon: Search },
        { to: "/lists", label: "My Lists", icon: ListChecks },
        { to: "/intros", label: "My Intros", icon: Mail },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { to: "/dashboard/founder", label: "Dashboard", icon: LayoutDashboard },
        { to: "/dashboard/founder/analytics", label: "Analytics", icon: BarChart3 },
        { to: "/intros", label: "Intro Requests", icon: Mail },
        { to: "/resources", label: "Resources", icon: FileText },
        { to: "/learn", label: "Learn", icon: GraduationCap },
        { to: "/settings", label: "Settings", icon: Settings },
      ];

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-60 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col">
        <Link to="/" className="flex items-center gap-2 font-semibold p-5 border-b border-sidebar-border">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Rocket className="w-4 h-4 text-primary-foreground" />
          </div>
          UpStart
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => {
            const active = path === it.to;
            const Icon = it.icon;
            return (
              <Link key={it.to} to={it.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}>
                <Icon className="w-4 h-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">{role}</div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
