import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { FileText, Download, ExternalLink, Sparkles } from "lucide-react";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
});

type Template = {
  title: string;
  description: string;
  category: string;
  format: string;
  url: string;
};

const TEMPLATES: Template[] = [
  {
    title: "One-Page Company Brief",
    description: "A concise overview template covering problem, solution, traction, and ask. Perfect for first-touch investor conversations.",
    category: "Company Overview",
    format: "Notion / Doc",
    url: "https://www.notion.so/templates/startup-one-pager",
  },
  {
    title: "Traction & Metrics Dashboard",
    description: "Structure your MRR, growth rate, churn, CAC, and LTV in a clean, investor-ready format.",
    category: "Metrics",
    format: "Google Sheets",
    url: "https://docs.google.com/spreadsheets/d/1lzgQk5jTnpd9JbVf-RbCKMbKE5xYVnTW/template/preview",
  },
  {
    title: "Financial Model (SaaS)",
    description: "Bottom-up SaaS financial model template with revenue, costs, runway, and 3-year projections.",
    category: "Financials",
    format: "Excel / Sheets",
    url: "https://www.causal.app/templates/saas-financial-model",
  },
  {
    title: "Product Roadmap",
    description: "Quarterly roadmap template to communicate vision, milestones, and shipping cadence.",
    category: "Product",
    format: "Notion",
    url: "https://www.notion.so/templates/product-roadmap",
  },
  {
    title: "Cap Table Template",
    description: "Track ownership, dilution scenarios, and option pool across rounds.",
    category: "Financials",
    format: "Google Sheets",
    url: "https://carta.com/learn/equity/cap-table/template/",
  },
  {
    title: "Customer Discovery Script",
    description: "Structured interview questions to validate problems before building.",
    category: "Research",
    format: "Doc",
    url: "https://www.ycombinator.com/library/6g-how-to-talk-to-users",
  },
  {
    title: "Pitch Deck Outline (10 slides)",
    description: "The classic Sequoia-style structure: problem, solution, market, product, traction, team, ask.",
    category: "Company Overview",
    format: "Slides",
    url: "https://www.sequoiacap.com/article/writing-a-business-plan/",
  },
  {
    title: "Hiring Plan & JD Templates",
    description: "Headcount planning sheet plus role-specific job description templates for early hires.",
    category: "Team",
    format: "Sheets / Doc",
    url: "https://www.firstround.com/review/the-best-job-descriptions-weve-seen/",
  },
];

const CATEGORIES = ["All", "Company Overview", "Metrics", "Financials", "Product", "Research", "Team"];

function ResourcesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/auth" }); return; }
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) return <AppShell role="founder"><div className="p-10 text-muted-foreground">Loading…</div></AppShell>;

  const filtered = filter === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter);

  return (
    <AppShell role="founder">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Founder Toolkit
          </div>
          <h1 className="text-3xl font-bold mb-2">Resources & Templates</h1>
          <p className="text-muted-foreground max-w-2xl">
            Battle-tested templates to structure your company's information — from one-pagers to financial models.
            Copy, customize, and share with investors.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition ${
                filter === c
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <a
              key={t.title}
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="group p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition flex flex-col"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
              </div>
              <h3 className="font-semibold text-lg mb-1.5 group-hover:text-primary transition">{t.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{t.description}</p>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                  {t.category}
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Download className="w-3 h-3" /> {t.format}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </AppShell>
  );
}