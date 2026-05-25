# UpStart Extension Plan

This is a large multi-feature extension. Below is the build order, grouped so each phase is independently shippable and respects the existing architecture (TanStack Start routes, Supabase RLS, AppShell sidebar, shadcn UI, dark-only design tokens).

## Phase 1 — Database migrations (one batch)

A single migration adds all new tables + columns + storage buckets + RLS:

**New tables**
- `investor_lists` (id, investor_id, name, color, created_at)
- `investor_list_items` (id, list_id, startup_id, added_at, unique(list_id,startup_id))
- `startup_labels` (id, investor_id, startup_id, label text, color)  ← per-investor tags
- `startup_team_members` (id, startup_id, name, title, photo_url, linkedin_url, bio, sort_order) — cap 15 in app
- `startup_media` (id, startup_id, kind enum: 'image'|'pdf'|'video', url, title, sort_order)
- `startup_existing_investors` (id, startup_id, name, amount, round, is_lead)
- `startup_revenue_proofs` (id, startup_id, file_url, label)
- `startup_fund_allocations` (id, startup_id, category enum, percentage)
- `startup_profile_views` (id, startup_id, investor_id, session_key, viewed_at) — unique(startup_id, investor_id, session_key)
- `user_settings` (user_id pk, theme text default 'midnight')

**Columns on `startup_profiles`**
- `intro_video_url`, `monthly_burn`, `runway_months`, `annual_revenue`, `hq_region`, `revenue_verified` (computed via trigger or app-side count)

**Storage buckets (public read for media, authenticated upload scoped by userId folder)**
- `startup-media` (images, videos)
- `startup-docs` (pdfs, revenue proofs)
- `team-photos`

**RLS**
- Founders own their startup_*, team_*, media, allocations, existing_investors, revenue_proofs (auth.uid() = startup.user_id via EXISTS)
- Investors own their lists/list_items/labels/views
- Public-authenticated read on team, media, existing_investors, allocations (so investors can see)
- Revenue proof files: only the owning founder can read (private bucket folder); investors only see the "verified ✓" boolean

## Phase 2 — Theme system

- Add 5 theme palettes as `[data-theme="..."]` blocks in `src/styles.css` (midnight default, emerald, crimson, slate, light) using the same token names already in use.
- `ThemeProvider` in `__root.tsx` reads `localStorage` instantly, then syncs from `user_settings` on auth.
- New `/settings` route with theme picker (swatches). Persists to `user_settings` table.
- Sidebar gets "Settings" entry for both roles.

## Phase 3 — Investor Lists & Labels

- New route `/lists` with sidebar entry "My Lists" (investor only).
- UI: left column = lists with rename/delete + "+ New list"; right column = startups in that list with "remove" and "move to…" menu.
- "Add to list" + label editor exposed as a popover on each startup card on `/dashboard/investor` and on `/startup/$id`.
- Labels render as small colored pills under the startup name on cards.

## Phase 4 — Expanded investor filters & sorting

Extend `dashboard/investor.tsx`:
- Add filter section (collapsible "More filters"): business model multi-select, HQ region text, MRR/growth/raise/team/users range sliders, three boolean toggles (revenue verified, video available, existing investors present).
- Sort dropdown gains: highest raise, most users, recently active (updated_at), newest. "Most viewed" uses count from `startup_profile_views`.
- Filter logic stays client-side over the existing fetched list (small dataset assumption keeps it simple).

## Phase 5 — Founder media uploads

- New `MediaUploader` component reused for video / images / pdfs.
- Founder dashboard gains "Product Media" card:
  - Intro video upload (≤ 100MB, mp4/mov/webm) — client-side duration check (≤ 180s) via `<video>` metadata before upload.
  - Up to 8 images, up to 3 PDFs — counts enforced client-side; rows stored in `startup_media`.
- Startup detail page renders:
  - Embedded `<video controls>` for intro
  - Image carousel (shadcn `carousel`)
  - PDF list as document cards with download/open

## Phase 6 — Team / Key People

- Founder dashboard "Key People" editor: list of up to 15 rows with photo upload (team-photos bucket), name, title, LinkedIn, bio, drag-to-reorder later (sort_order field, simple up/down for now).
- Startup detail renders grid: 5 cols desktop / 2 cols mobile, circular avatar, name, title; click opens dialog with bio + LinkedIn.

## Phase 7 — Financial proof & funding

- Founder dashboard "Financials" card: monthly burn, runway, annual revenue inputs.
- Revenue proof uploader (≤ 5 files) writes to `startup_revenue_proofs`; presence of ≥1 row → "✓ Revenue Verified" badge on startup detail + investor card filter source.
- Replace use_of_funds textarea with structured allocator: 5 category rows with % inputs that must sum to 100 (live validation), rendered as horizontal progress bars on startup detail.

## Phase 8 — Existing investors

- Founder dashboard "Existing Investors" editor: add/remove rows (name, amount, round, lead toggle).
- Startup detail renders cards with "LEAD" badge when applicable.

## Phase 9 — Founder analytics

- Track view: on `/startup/$id`, after auth check, insert into `startup_profile_views` with `session_key = sessionStorage.getItem('view_session') || crypto.randomUUID()`; unique constraint dedupes within the session.
- New route `/dashboard/founder/analytics` + sidebar entry "Analytics".
- Page shows KPI tiles (total views, unique investors, intros, accepted, conversion %), two line charts (views over time, intros over time) using `recharts`, and a recent activity feed (joined view + intro rows ordered by created_at).

## Technical notes (concise)

- All new tables use `auth.uid()`-scoped RLS; investors can only see/modify their own lists/labels/views.
- Revenue proofs bucket is private; investors only see the verified boolean (computed in a server function or via `count > 0` exposed via `revenue_verified` column kept in sync by a trigger).
- Theme tokens reuse existing variable names (`--background`, `--foreground`, `--primary`, `--card`, etc.) so no component touches concrete colors.
- All uploads go through a single `useStorageUpload` helper that enforces size/type and writes to `{bucket}/{userId}/{startupId}/{uuid}.{ext}`.
- Charts: add `recharts` (already common in shadcn projects).
- Sidebar `AppShell` gains conditional items (investor: My Lists, Settings; founder: Analytics, Settings) without restructuring the component.

## Out of scope (explicit)

- No changes to auth flow, role selection, onboarding role pickers, intro request flow, or existing resources/learn routes.
- No realtime; lists/labels/analytics refresh on navigation.
- No drag-and-drop reordering in v1 (sort_order via up/down buttons).

## Confirmation

This is ~9 phases touching ~25 files and ~10 new tables. Reply "go" to proceed end-to-end, or tell me which phases to prioritize (e.g. "just themes + lists + filters first").