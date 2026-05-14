import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Play, Clock, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
});

type Video = {
  title: string;
  speaker: string;
  duration: string;
  topic: string;
  description: string;
  youtubeId: string;
};

const VIDEOS: Video[] = [
  {
    title: "How to Start a Startup",
    speaker: "Sam Altman",
    duration: "46 min",
    topic: "Fundamentals",
    description: "The four areas you need to be great at: idea, product, team, and execution.",
    youtubeId: "CBYhVcO4WgI",
  },
  {
    title: "How to Build Products Users Love",
    speaker: "Kevin Hale",
    duration: "50 min",
    topic: "Product",
    description: "Frameworks for building products that retain — focus on the smallest set of users who love you.",
    youtubeId: "sz_LgBAGYyo",
  },
  {
    title: "How to Talk to Users",
    speaker: "Eric Migicovsky",
    duration: "30 min",
    topic: "Research",
    description: "The Mom Test in practice: how to extract real signal from customer conversations.",
    youtubeId: "MT4Ig2uqjTc",
  },
  {
    title: "How to Raise Money",
    speaker: "Marc Andreessen, Ron Conway, Parker Conrad",
    duration: "50 min",
    topic: "Fundraising",
    description: "What investors actually look for, how to run a process, and how to negotiate terms.",
    youtubeId: "uvW8Pl6Ag4Q",
  },
  {
    title: "How to Find Product Market Fit",
    speaker: "Peter Reinhardt",
    duration: "47 min",
    topic: "Product",
    description: "The Segment story: how to recognize PMF signals and what to do before you have them.",
    youtubeId: "0LNQxT9LvM0",
  },
  {
    title: "Building Culture and Team",
    speaker: "Patrick & John Collison, Ben Silbermann",
    duration: "47 min",
    topic: "Team",
    description: "How Stripe and Pinterest founders thought about culture, hiring, and early team dynamics.",
    youtubeId: "JQDpyEnYczg",
  },
  {
    title: "Sales and Marketing for Startups",
    speaker: "Tyler Bosmeny",
    duration: "46 min",
    topic: "Sales",
    description: "The reality of early-stage sales: lead generation, closing, and the funnel that actually works.",
    youtubeId: "xCkUyT6mLJ4",
  },
  {
    title: "How to Manage",
    speaker: "Ben Horowitz",
    duration: "48 min",
    topic: "Leadership",
    description: "The hard things about hard things — managing through chaos, layoffs, and difficult decisions.",
    youtubeId: "uVhTvQXfibU",
  },
];

const TOPICS = ["All", "Fundamentals", "Product", "Research", "Fundraising", "Team", "Sales", "Leadership"];

function LearnPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/auth" }); return; }
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) return <AppShell role="founder"><div className="p-10 text-muted-foreground">Loading…</div></AppShell>;

  const filtered = filter === "All" ? VIDEOS : VIDEOS.filter((v) => v.topic === filter);

  return (
    <AppShell role="founder">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-mono mb-3">
            <GraduationCap className="w-3.5 h-3.5" /> Founder School
          </div>
          <h1 className="text-3xl font-bold mb-2">Learn from Operators</h1>
          <p className="text-muted-foreground max-w-2xl">
            Curated talks from founders, investors, and operators on the craft of building a company —
            from finding PMF to scaling teams.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TOPICS.map((c) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <button
              key={v.youtubeId}
              onClick={() => setActive(v)}
              className="group text-left rounded-xl bg-card border border-border hover:border-primary/40 transition overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="relative aspect-video bg-secondary overflow-hidden">
                <img
                  src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition">
                    <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-background/80 text-xs font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {v.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary border border-primary/30 uppercase tracking-wider">
                    {v.topic}
                  </span>
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition">{v.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 font-mono">{v.speaker}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{v.description}</p>
              </div>
            </button>
          ))}
        </div>

        {active && (
          <div
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActive(null)}
          >
            <div
              className="w-full max-w-4xl bg-card border border-border rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{active.title}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{active.speaker}</p>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-secondary transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}