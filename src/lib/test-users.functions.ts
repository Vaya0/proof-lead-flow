import { createServerFn } from "@tanstack/react-start";

export type TestUserRole = "founder" | "investor";

const TEST_PASSWORD = "TestUser!2026";

const TEST_ACCOUNTS: Record<TestUserRole, { email: string; full_name: string }> = {
  founder: { email: "founder.demo@upstart.test", full_name: "Demo Founder" },
  investor: { email: "investor.demo@upstart.test", full_name: "Demo Investor" },
};

export const ensureTestUser = createServerFn({ method: "POST" })
  .inputValidator((input: { role: TestUserRole }) => {
    if (input.role !== "founder" && input.role !== "investor") {
      throw new Error("Invalid role");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const account = TEST_ACCOUNTS[data.role];

    // List users and check for the test email (admin API).
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1, perPage: 200,
    });
    if (listErr) throw listErr;
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === account.email.toLowerCase());

    if (!existing) {
      const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: account.full_name, role: data.role },
      });
      if (createErr) throw createErr;
    }

    return { email: account.email, password: TEST_PASSWORD };
  });