export const INDUSTRIES = ["SaaS", "Fintech", "HealthTech", "EdTech", "DevTools", "AI/ML", "Other"] as const;
export const BUSINESS_MODELS = ["B2B", "B2C", "B2B2C", "Marketplace"] as const;
export const STAGES = ["Pre-seed", "Seed", "Series A"] as const;

export const stageBadgeClass = (stage: string) => {
  switch (stage) {
    case "Pre-seed": return "bg-secondary text-muted-foreground border-border";
    case "Seed": return "bg-primary/15 text-primary border-primary/30";
    case "Series A": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    default: return "bg-secondary text-muted-foreground border-border";
  }
};
