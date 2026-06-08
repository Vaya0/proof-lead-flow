import { createFileRoute, Link } from "@tanstack/react-router";
import { Rocket, Target, ArrowRight, CheckCircle2, LineChart, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Rocket className="w-4 h-4 text-primary-foreground" />
            </div>
            UpStart
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition">Log in</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative max-w-[1200px] mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Now accepting Q1 2026 cohort
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Investors want proof.<br />
            <span className="text-muted-foreground">Not ideas.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            UpStart connects execution-ready startups with thesis-matched investors. No decks. No cold emails. Just signal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth" search={{ role: "founder" }} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow-primary">
              Apply as Founder <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/auth" search={{ role: "investor" }} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border bg-card text-foreground font-medium hover:bg-secondary transition">
              Join as Investor
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-sm text-primary font-mono mb-3">HOW IT WORKS</div>
          <h2 className="text-4xl font-bold tracking-tight">Signal in. Signal out.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Step
            icon={<Rocket className="w-5 h-5" />}
            title="For Founders"
            steps={["Ship your MVP", "Fill your traction profile", "Get matched"]}
          />
          <Step
            icon={<LineChart className="w-5 h-5" />}
            title="Matchmaking"
            steps={["Thesis-aligned filtering", "Double opt-in intros", "No spam, ever"]}
            accent
          />
          <Step
            icon={<Target className="w-5 h-5" />}
            title="For Investors"
            steps={["Set your thesis", "Browse matched startups", "Request intro"]}
          />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/30">
        <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <Stat value="142" label="Startups onboarded" />
          <Stat value="89" label="Active investors" />
          <Stat value="$4.2M" label="In intros facilitated" />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary/80" />
          <span className="font-semibold text-foreground">UpStart</span>
        </div>
        <div className="flex items-center gap-6">
          <a className="hover:text-foreground transition" href="#">Privacy</a>
          <a className="hover:text-foreground transition" href="#">Terms</a>
          <span>© 2026 UpStart</span>
        </div>
      </footer>
    </div>
  );
}

function Step({ icon, title, steps, accent }: { icon: React.ReactNode; title: string; steps: string[]; accent?: boolean }) {
  return (
    <div
      className={`p-8 rounded-xl bg-card border border-border ${accent ? "ring-1 ring-primary/30" : ""}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-5 ${accent ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <ul className="space-y-3">
        {steps.map((s) => (
          <li key={s} className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-4xl font-semibold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-2">{label}</div>
    </div>
  );
}
