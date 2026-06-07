import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Field, inputClass } from "@/components/FormField";
import { INDUSTRIES, BUSINESS_MODELS, STAGES } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { LogoUploader } from "@/components/LogoUploader";

export const Route = createFileRoute("/onboarding/founder")({
  component: FounderOnboarding,
});

type Form = {
  startup_name: string; tagline: string; industry: string; business_model: string;
  stage: string; founded_year: string; hq_location: string;
  demo_url: string; mrr: string; growth_rate: string; total_users: string;
  traction_description: string; team_size: string;
  raise_amount: string; use_of_funds: string; founder_name: string; linkedin_url: string;
  logo_url: string;
};

const empty: Form = {
  startup_name: "", tagline: "", industry: "SaaS", business_model: "B2B",
  stage: "Pre-seed", founded_year: String(new Date().getFullYear()), hq_location: "",
  demo_url: "", mrr: "0", growth_rate: "0", total_users: "0",
  traction_description: "", team_size: "1",
  raise_amount: "0", use_of_funds: "", founder_name: "", linkedin_url: "",
  logo_url: "",
};

function FounderOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/auth" });
      else setUserId(data.session.user.id);
    });
  }, [navigate]);

  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) throw new Error("Not signed in");
      const { error } = await supabase.from("startup_profiles").insert({
        user_id: sess.user.id,
        startup_name: form.startup_name,
        tagline: form.tagline,
        industry: form.industry,
        business_model: form.business_model,
        stage: form.stage,
        founded_year: parseInt(form.founded_year),
        hq_location: form.hq_location,
        demo_url: form.demo_url,
        mrr: parseFloat(form.mrr),
        growth_rate: parseFloat(form.growth_rate),
        total_users: parseInt(form.total_users),
        traction_description: form.traction_description,
        team_size: parseInt(form.team_size),
        raise_amount: parseFloat(form.raise_amount),
        use_of_funds: form.use_of_funds,
        founder_name: form.founder_name,
        linkedin_url: form.linkedin_url,
        logo_url: form.logo_url || null,
      });
      if (error) throw error;
      toast.success("Profile saved");
      navigate({ to: "/dashboard/founder" });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
            <span>Step {step} of 3</span>
            <span className="font-mono">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-card rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>

        <div className="p-8 rounded-xl bg-card border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold">Company Basics</h2>
              <p className="text-muted-foreground text-sm">Tell us about your startup.</p>
              {userId && (
                <Field label="Company Logo">
                  <LogoUploader
                    userId={userId}
                    name={form.startup_name || "?"}
                    value={form.logo_url}
                    onChange={(url) => set("logo_url")(url ?? "")}
                  />
                </Field>
              )}
              <Field label="Startup Name" tooltip="The official, public name of your company. This is how investors will find you."><input className={inputClass} value={form.startup_name} onChange={(e) => set("startup_name")(e.target.value)} required /></Field>
              <Field label="Tagline" hint="Max 120 characters" tooltip="One sentence that explains what you do. Think of it as the headline of your pitch."><input maxLength={120} className={inputClass} value={form.tagline} onChange={(e) => set("tagline")(e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Industry" tooltip="The primary sector you operate in. Used to match you with investors who focus on this space."><select className={inputClass} value={form.industry} onChange={(e) => set("industry")(e.target.value)}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></Field>
                <Field label="Business Model" tooltip="Who pays you and how. e.g. B2B (you sell to other businesses), B2C (consumers), Marketplace, etc."><select className={inputClass} value={form.business_model} onChange={(e) => set("business_model")(e.target.value)}>{BUSINESS_MODELS.map(i => <option key={i}>{i}</option>)}</select></Field>
                <Field label="Stage" tooltip="Your fundraising stage. Pre-seed = idea/early, Seed = first real round, Series A = scaling proven traction."><select className={inputClass} value={form.stage} onChange={(e) => set("stage")(e.target.value)}>{STAGES.map(i => <option key={i}>{i}</option>)}</select></Field>
                <Field label="Founded Year" tooltip="The year your company was legally formed or work began."><input type="number" className={inputClass} value={form.founded_year} onChange={(e) => set("founded_year")(e.target.value)} /></Field>
              </div>
              <Field label="HQ Location" tooltip="The city and country where your team is primarily based. Remote? Use the founder's location."><input className={inputClass} value={form.hq_location} onChange={(e) => set("hq_location")(e.target.value)} placeholder="San Francisco, CA" /></Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold">Proof of Work</h2>
              <p className="text-muted-foreground text-sm">Show real traction. Numbers over narrative.</p>
              <Field label="Demo / Product URL" tooltip="A live link investors can click to try your product, or a short demo video URL."><input type="url" className={inputClass} value={form.demo_url} onChange={(e) => set("demo_url")(e.target.value)} placeholder="https://" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="MRR (USD)" tooltip="Monthly Recurring Revenue — the predictable revenue you collect every month from active customers."><input type="number" className={`${inputClass} font-mono`} value={form.mrr} onChange={(e) => set("mrr")(e.target.value)} /></Field>
                <Field label="MoM Growth (%)" tooltip="Month-over-Month growth in revenue or users. (This month − last month) ÷ last month × 100."><input type="number" className={`${inputClass} font-mono`} value={form.growth_rate} onChange={(e) => set("growth_rate")(e.target.value)} /></Field>
                <Field label="Total Users" tooltip="The total number of registered users or active customers on your product today."><input type="number" className={`${inputClass} font-mono`} value={form.total_users} onChange={(e) => set("total_users")(e.target.value)} /></Field>
                <Field label="Team Size" tooltip="Full-time equivalent people working on the company, including founders."><input type="number" className={`${inputClass} font-mono`} value={form.team_size} onChange={(e) => set("team_size")(e.target.value)} /></Field>
              </div>
              <Field label="Traction Description" hint="Max 300 characters" tooltip="A short paragraph with concrete proof of progress: customers, contracts, growth, partnerships, or pilots."><textarea maxLength={300} rows={3} className={inputClass} value={form.traction_description} onChange={(e) => set("traction_description")(e.target.value)} /></Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold">Fundraising Ask</h2>
              <p className="text-muted-foreground text-sm">What you need and how you'll deploy it.</p>
              <Field label="Raise Amount (USD)" tooltip="How much capital you are raising in this round, in US dollars."><input type="number" className={`${inputClass} font-mono`} value={form.raise_amount} onChange={(e) => set("raise_amount")(e.target.value)} /></Field>
              <Field label="Use of Funds" hint="Max 200 characters" tooltip="High-level breakdown of how you'll spend the money: hiring, product, GTM, runway, etc."><textarea maxLength={200} rows={3} className={inputClass} value={form.use_of_funds} onChange={(e) => set("use_of_funds")(e.target.value)} /></Field>
              <Field label="Founder Name" tooltip="Primary founder / CEO full name. Shown to investors on your profile."><input className={inputClass} value={form.founder_name} onChange={(e) => set("founder_name")(e.target.value)} /></Field>
              <Field label="LinkedIn URL" tooltip="Public LinkedIn profile of the primary founder. Helps investors verify the team."><input type="url" className={inputClass} value={form.linkedin_url} onChange={(e) => set("linkedin_url")(e.target.value)} placeholder="https://linkedin.com/in/..." /></Field>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50">
                {saving ? "Saving..." : <>Submit <Check className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
