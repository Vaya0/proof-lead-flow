import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Field, inputClass } from "@/components/FormField";
import { INDUSTRIES, STAGES } from "@/lib/constants";
import { Check } from "lucide-react";

export const Route = createFileRoute("/onboarding/investor")({
  component: InvestorOnboarding,
});

function InvestorOnboarding() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", fund_name: "", role_title: "", thesis: "",
    preferred_industries: [] as string[], target_stages: [] as string[],
    min_ticket: "25000", max_ticket: "250000", linkedin_url: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/auth" });
    });
  }, [navigate]);

  const togglePill = (key: "preferred_industries" | "target_stages", v: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) throw new Error("Not signed in");
      const { error } = await supabase.from("investor_profiles").insert({
        user_id: sess.user.id,
        full_name: form.full_name,
        fund_name: form.fund_name,
        role_title: form.role_title,
        thesis: form.thesis,
        preferred_industries: form.preferred_industries,
        target_stages: form.target_stages,
        min_ticket: parseFloat(form.min_ticket),
        max_ticket: parseFloat(form.max_ticket),
        linkedin_url: form.linkedin_url,
      });
      if (error) throw error;
      toast.success("Profile saved");
      navigate({ to: "/dashboard/investor" });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Set your thesis</h1>
        <p className="text-muted-foreground mb-8">We'll filter startups to what you actually back.</p>

        <form onSubmit={submit} className="p-8 rounded-xl bg-card border border-border space-y-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name"><input required className={inputClass} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
            <Field label="Fund / Firm"><input required className={inputClass} value={form.fund_name} onChange={(e) => setForm({ ...form, fund_name: e.target.value })} /></Field>
          </div>
          <Field label="Role / Title"><input required className={inputClass} value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} placeholder="Partner, Principal, etc." /></Field>
          <Field label="Investment Thesis" hint="Max 300 characters">
            <textarea required maxLength={300} rows={3} className={inputClass} value={form.thesis} onChange={(e) => setForm({ ...form, thesis: e.target.value })} />
          </Field>

          <div>
            <span className="block text-sm text-muted-foreground mb-2">Preferred Industries</span>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <button type="button" key={i} onClick={() => togglePill("preferred_industries", i)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${form.preferred_industries.includes(i)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-sm text-muted-foreground mb-2">Target Stage</span>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button type="button" key={s} onClick={() => togglePill("target_stages", s)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${form.target_stages.includes(s)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Ticket (USD)"><input type="number" required className={`${inputClass} font-mono`} value={form.min_ticket} onChange={(e) => setForm({ ...form, min_ticket: e.target.value })} /></Field>
            <Field label="Max Ticket (USD)"><input type="number" required className={`${inputClass} font-mono`} value={form.max_ticket} onChange={(e) => setForm({ ...form, max_ticket: e.target.value })} /></Field>
          </div>
          <Field label="LinkedIn URL"><input required type="url" className={inputClass} value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." /></Field>

          <button disabled={saving} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50">
            {saving ? "Saving..." : <>Save Profile <Check className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
