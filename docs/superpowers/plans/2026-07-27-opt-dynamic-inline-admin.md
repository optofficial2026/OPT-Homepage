# OPT Dynamic Inline Admin Implementation Plan

> **Execution mode:** Run this plan sequentially in the current repository. Keep the current visual system and page structure. Do not introduce a separate admin route, client router, rich-text editor, or CMS.

**Goal:** Preserve the existing OPT website design while adding Supabase-backed content, inline administrator controls, activity/archive detail pages, the adopted hackathon detail design, and GitHub Pages deployment.

**Architecture:** The existing Vite/React multi-page build remains the shell. Each page loads content through one repository module using the priority `Supabase → localStorage cache → bundled defaults`. Supabase Auth identifies administrators, Postgres stores structured content, and one Storage bucket holds web images. Detail pages reuse `/log/?id=<slug>` and `/archive/?id=<slug>` so no router dependency is needed. Administrator controls appear only after login and edit-mode activation.

**Tech stack:** React 19, TypeScript, Vite, Supabase JS, Supabase Auth/Postgres/Storage, GitHub Actions/Pages, Node test runner.

## Constraints and accepted decisions

- Do not alter the existing site identity, layout language, navigation model, animation character, or public feature set except where this plan explicitly adds dynamic content.
- Keep the adopted `/Users/sonseongwon/Downloads/OPT Hackathon Detail.html` as the visual reference for hackathon details.
- Use plain text, URLs, and small structured lists instead of a rich-text editor.
- Store only JPEG, PNG, and WebP images up to 5 MB in Supabase Storage. Link large documents externally.
- Never ship a Supabase service-role key. The browser receives only the public project URL and publishable/anon key.
- Authorization must be enforced by Row Level Security. Hiding buttons is not a security boundary.
- A missing or unavailable Supabase project must not blank the public site.
- The current untracked user files are out of scope and must remain untouched.

## Task 1: Establish data contracts and Supabase schema

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `.env.example`
- Create: `src/data/types.ts`
- Modify: `src/data/content.ts`
- Create: `supabase/migrations/20260727000000_initial_content.sql`
- Create: `test/content-model.test.mjs`

**Step 1: Write failing model contract tests**

Add Node tests for:

- home statistics always render as `integer + "+"`;
- invalid negative and decimal statistics are normalized to non-negative integers;
- timeline items sort newest first;
- duplicate or empty slugs are rejected by the content validator;
- an archive record distinguishes `seminar` and `hackathon`;
- a hackathon detail can hold hero image, problem, solution, features, gallery, process, architecture, retrospective, result, stack, team, and external links.

Run:

```bash
npm test
```

Expected: failure because the new model helpers and test target do not exist.

**Step 2: Add the minimal content types and helpers**

Define:

```ts
type SiteSettings = {
  recruitmentEnabled: boolean;
  recruitmentCohort: number;
  recruitmentCount: number;
  recruitmentFormUrl: string;
  recruitmentClosedMessage: string;
  activityCohorts: number;
  activityMembers: number;
  activityPrograms: number;
};

type TimelineItem = {
  id: string;
  occurredOn: string;
  title: string;
  description: string;
};

type ActivityPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  occurredOn: string;
  cohort: number;
  category: string;
  thumbnailUrl: string;
  heroImageUrl: string;
  galleryUrls: string[];
};

type ArchiveItem = {
  id: string;
  slug: string;
  kind: 'seminar' | 'hackathon';
  title: string;
  summary: string;
  occurredOn: string;
  cohort: number;
  thumbnailUrl: string;
  detail: SeminarDetail | HackathonDetail;
};
```

Move the current static content into typed defaults without changing its visible wording. Add small pure helpers such as `formatStat`, `sortTimelineNewestFirst`, and `validateSlug`.

**Step 3: Create the database migration**

Create:

- `site_settings`: singleton row;
- `timeline_items`;
- `activity_posts`;
- `archive_items`;
- `admin_profiles` keyed to `auth.users`;
- `updated_at` triggers;
- public `SELECT` policies;
- administrator-only `INSERT`, `UPDATE`, and `DELETE` policies using `admin_profiles`;
- private-by-policy write access and public read access for the `content-media` bucket;
- seed data matching the bundled defaults.

The policy helper must use `auth.uid()` and must not depend on client-supplied role text.

**Step 4: Add environment documentation**

Expose only:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SITE_BASE_PATH=/
```

Document in comments that local fallback is expected until these values are configured.

**Step 5: Install Supabase JS and run tests**

Run:

```bash
npm install @supabase/supabase-js
npm test
npm run typecheck
```

Expected: model tests pass; current application still typechecks.

**Step 6: Commit**

```bash
git add package.json package-lock.json .env.example src/data/types.ts src/data/content.ts supabase/migrations/20260727000000_initial_content.sql test/content-model.test.mjs
git commit -m "feat: define dynamic content model"
```

## Task 2: Add resilient content loading and cache

**Files:**

- Create: `src/lib/supabase.ts`
- Create: `src/lib/content-cache.ts`
- Create: `src/lib/content-repository.ts`
- Create: `src/hooks/useSiteContent.ts`
- Create: `test/content-cache.test.mjs`
- Modify: `package.json`

**Step 1: Write failing fallback tests**

Cover:

- valid remote records win over cache and defaults;
- remote failure uses a valid cached snapshot;
- invalid JSON or the wrong cache version uses bundled defaults;
- a successful remote fetch refreshes the cache;
- missing Supabase environment variables return a disabled client rather than throwing.

Run:

```bash
npm test
```

Expected: failure because cache and repository modules are missing.

**Step 2: Implement a single optional Supabase client**

`src/lib/supabase.ts` creates a client only when both public environment values exist. It exports `supabase` as `null` when configuration is absent.

**Step 3: Implement versioned browser cache**

Use one localStorage key and this envelope:

```ts
type CachedContent = {
  version: 1;
  savedAt: string;
  data: SiteContent;
};
```

Catch storage quota, parse, and access errors. Never make cache failure fatal.

**Step 4: Implement repository reads and React hook**

`loadSiteContent()` queries the four content sources, maps database snake_case to TypeScript camelCase, and returns `{ data, source, error }`. `useSiteContent()` owns loading, refetch, and public error state. It must keep current content on screen during a failed refresh.

**Step 5: Verify and commit**

```bash
npm test
npm run typecheck
git add package.json src/lib src/hooks/useSiteContent.ts test/content-cache.test.mjs
git commit -m "feat: load content with offline fallback"
```

## Task 3: Add authentication and inline edit mode

**Files:**

- Create: `src/hooks/useAdminSession.ts`
- Create: `src/components/AdminContext.tsx`
- Create: `src/components/AdminLoginDialog.tsx`
- Create: `src/components/AdminToolbar.tsx`
- Create: `src/components/EditDialog.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/index.css`
- Modify: `test/homepage.test.mjs`

**Step 1: Extend source-contract tests**

Assert that:

- there is no `/admin` route or separate admin HTML;
- login begins from the existing footer;
- edit controls require both an administrator session and edit mode;
- the app does not infer authorization only from email or browser storage.

Run tests and confirm failure.

**Step 2: Implement session and profile verification**

`useAdminSession()` subscribes to Supabase Auth and queries the current user’s `admin_profiles` row. It exports:

```ts
{
  user,
  isAdmin,
  isEditMode,
  setEditMode,
  signIn,
  signOut,
  loading,
}
```

With no Supabase configuration, public browsing remains fully available and login shows a concise setup message.

**Step 3: Add existing-page controls**

- Footer: low-emphasis “관리자 로그인”.
- Signed-in administrator: fixed but unobtrusive toolbar with “편집 시작/종료” and “로그아웃”.
- `EditDialog`: native `<dialog>` shell shared by simple forms; no schema-driven form engine.
- Public users and administrators outside edit mode see the original page without edit buttons.

**Step 4: Verify and commit**

```bash
npm test
npm run typecheck
npm run build
git add src/App.tsx src/components src/hooks/useAdminSession.ts src/index.css test/homepage.test.mjs
git commit -m "feat: add inline administrator mode"
```

## Task 4: Make home settings, recruitment, and timeline editable

**Files:**

- Modify: `src/pages/HomePage.tsx`
- Modify: `src/App.tsx`
- Create: `src/components/HomeSettingsDialog.tsx`
- Create: `src/components/TimelineItemDialog.tsx`
- Create: `src/lib/content-mutations.ts`
- Modify: `src/index.css`
- Modify: `test/homepage.test.mjs`

**Step 1: Write failing behavior contracts**

Assert:

- recruiting mode off hides ticker, hero recruiting badge, navigation recruitment CTA, and recruitment modal/component;
- recruiting mode off keeps the bottom banner with the configured closed message;
- recruiting mode on uses editable cohort, count, and form URL;
- statistics use `N+`;
- timeline is newest first, scrollable, and initialized at scroll position zero;
- add/edit/delete buttons occur only within the administrator edit guard.

**Step 2: Implement mutation functions**

Add explicit functions:

```ts
updateSiteSettings(input)
createTimelineItem(input)
updateTimelineItem(id, input)
deleteTimelineItem(id)
```

Each function requires an active Supabase client, returns a typed result, and triggers `refetch()` only after success.

**Step 3: Bind current home UI to content**

Replace hardcoded values with loaded settings/default data while retaining existing markup and classes wherever possible. Add small contextual buttons next to the settings and timeline headings only in edit mode.

Use a scroll container with newest entries first. On first render and after a refetch, set `scrollTop = 0`.

**Step 4: Verify and commit**

```bash
npm test
npm run typecheck
npm run build
git add src/App.tsx src/pages/HomePage.tsx src/components/HomeSettingsDialog.tsx src/components/TimelineItemDialog.tsx src/lib/content-mutations.ts src/index.css test/homepage.test.mjs
git commit -m "feat: manage home content inline"
```

## Task 5: Add activity posts and detail pages

**Files:**

- Modify: `src/pages/LogPage.tsx`
- Create: `src/pages/ActivityDetailPage.tsx`
- Create: `src/components/ActivityPostDialog.tsx`
- Create: `src/components/MediaGallery.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Modify: `test/homepage.test.mjs`

**Step 1: Write failing navigation and content tests**

Assert:

- activity cards link to `/log/?id=<encoded slug>` using the configured base path;
- missing and unknown IDs show the list or a clear not-found state with a back link;
- the detail page contains title, metadata, summary/body, hero image, and optional gallery;
- public activity cards do not show edit controls.

**Step 2: Implement list/detail selection without a router**

Read `URLSearchParams(location.search).get('id')` in the log entry point. Render the detail component when a matching post exists; otherwise render the current list. Preserve existing filters and scroll-to-top behavior when returning.

**Step 3: Add inline CRUD**

Add “새 활동 기록”, “수정”, and “삭제” only in edit mode. Use a fixed form for title, slug, date, cohort, category, summary, body, thumbnail URL, hero URL, and gallery URLs.

**Step 4: Verify and commit**

```bash
npm test
npm run typecheck
npm run build
git add src/App.tsx src/pages/LogPage.tsx src/pages/ActivityDetailPage.tsx src/components/ActivityPostDialog.tsx src/components/MediaGallery.tsx src/index.css test/homepage.test.mjs
git commit -m "feat: add activity detail publishing"
```

## Task 6: Add archive seminar details and adopted hackathon details

**Files:**

- Modify: `src/pages/ArchivePage.tsx`
- Create: `src/pages/SeminarDetailPage.tsx`
- Create: `src/pages/HackathonDetailPage.tsx`
- Create: `src/components/ArchiveItemDialog.tsx`
- Create: `src/components/HackathonDetailDialog.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Modify: `test/homepage.test.mjs`

**Step 1: Write failing archive tests**

Assert:

- seminar and hackathon items link to `/archive/?id=<encoded slug>`;
- kind selects the correct detail component;
- unknown IDs show a clear recovery path;
- the hackathon page contains every adopted HTML section;
- adopted prototype replace/edit buttons are administrator-only.

**Step 2: Implement seminar detail**

Use the current design language for title, metadata, hero, overview/body, gallery, references, and back navigation.

**Step 3: Implement the adopted hackathon detail**

Translate the supplied HTML into React while keeping:

- back link;
- HACKATHON/cohort/date/award metadata;
- title and tagline;
- hero slot;
- problem and solution;
- four-or-variable feature list;
- project gallery;
- development process;
- architecture flow and explanation;
- retrospective;
- result/award card;
- technology stack;
- team members and roles;
- GitHub/demo/presentation links.

Do not copy prototype `.dc.html` links or `#` actions. Use real app URLs and optional external URLs. Render image replacement and section edit controls only inside the administrator edit guard.

**Step 4: Add archive CRUD**

Use a short common archive form for list metadata. Open the kind-specific detail form for seminar or hackathon fields. Persist detail objects in `archive_items.detail`.

**Step 5: Verify and commit**

```bash
npm test
npm run typecheck
npm run build
git add src/App.tsx src/pages/ArchivePage.tsx src/pages/SeminarDetailPage.tsx src/pages/HackathonDetailPage.tsx src/components/ArchiveItemDialog.tsx src/components/HackathonDetailDialog.tsx src/index.css test/homepage.test.mjs
git commit -m "feat: add archive detail publishing"
```

## Task 7: Add safe image upload and replacement

**Files:**

- Create: `src/lib/media-storage.ts`
- Create: `src/components/ImageUploadField.tsx`
- Modify: `src/components/ActivityPostDialog.tsx`
- Modify: `src/components/ArchiveItemDialog.tsx`
- Modify: `src/components/HackathonDetailDialog.tsx`
- Create: `test/media-storage.test.mjs`

**Step 1: Write failing validation tests**

Cover accepted MIME types, the 5 MB limit, safe generated paths, and rejection of unsupported files.

**Step 2: Implement validation and upload**

Generate paths such as:

```text
activity/<record-id>/<uuid>.webp
archive/<record-id>/<uuid>.jpg
```

Upload only after client validation. Keep URL input available so administrators can use an externally hosted image. Do not delete the old object until the record update succeeds.

**Step 3: Verify and commit**

```bash
npm test
npm run typecheck
npm run build
git add src/lib/media-storage.ts src/components/ImageUploadField.tsx src/components/ActivityPostDialog.tsx src/components/ArchiveItemDialog.tsx src/components/HackathonDetailDialog.tsx test/media-storage.test.mjs
git commit -m "feat: support managed content images"
```

## Task 8: Configure GitHub Pages and future custom domain

**Files:**

- Modify: `vite.config.ts`
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`
- Modify: `test/homepage.test.mjs`

**Step 1: Write failing deployment contracts**

Assert:

- Vite base reads `VITE_SITE_BASE_PATH`;
- Pages workflow builds all three HTML entry points;
- workflow receives only public Supabase variables;
- no secret/service-role key pattern appears in tracked frontend/config files.

**Step 2: Add base-path helpers**

Use:

```ts
base: process.env.VITE_SITE_BASE_PATH || '/'
```

All internal links must be produced through a single helper that joins the base path with `/`, `/log/`, or `/archive/`.

For the repository URL use `/<repository-name>/`; after `opt.it.kr` is configured, use `/`.

**Step 3: Add Pages workflow**

On pushes to `main`:

- checkout;
- setup Node;
- `npm ci`;
- `npm test`;
- `npm run typecheck`;
- `npm run build`;
- upload `dist`;
- deploy Pages.

Use repository Actions variables/secrets only for the public Supabase URL and publishable key.

**Step 4: Document one-time operations**

README instructions must cover:

1. create Supabase project;
2. run the migration;
3. create an Auth user;
4. insert that user ID into `admin_profiles`;
5. create repository variables;
6. enable GitHub Pages via Actions;
7. later set the custom domain and DNS;
8. set `VITE_SITE_BASE_PATH=/` after custom-domain activation.

**Step 5: Verify and commit**

```bash
npm test
npm run typecheck
npm run build
git add vite.config.ts .github/workflows/deploy-pages.yml README.md test/homepage.test.mjs
git commit -m "ci: deploy website to github pages"
```

## Task 9: Perform the three requested verification passes

**Files:**

- Create: `docs/verification/2026-07-27-dynamic-site-verification.md`

### Pass 1 — Functional behavior

Run automated checks and browser walkthroughs for:

- home, activity list/detail, archive list/seminar/hackathon detail;
- recruiting on and off;
- all three statistic formats;
- timeline newest-first/scroll behavior;
- admin login/edit/logout;
- all CRUD dialogs and link navigation.

Commands:

```bash
npm test
npm run typecheck
npm run build
npm run dev -- --host 127.0.0.1
```

Record failures, fixes, and the final result.

### Pass 2 — Security and failure behavior

Check:

- anonymous direct insert/update/delete requests are rejected by RLS;
- a normal authenticated user without `admin_profiles` remains read-only;
- administrator mutations succeed;
- unsupported/oversized images fail;
- missing env, offline Supabase, corrupt cache, and unknown detail slugs degrade safely;
- built assets contain no service-role key.

Live RLS checks are marked **pending external setup** until the user provides a configured Supabase project. Do not report them as passed from source inspection alone.

### Pass 3 — Deployment and operation

Check:

- repository-path build;
- root/custom-domain build;
- nested direct URLs `/log/` and `/archive/`;
- Actions workflow syntax and artifact contents;
- page refresh and back navigation;
- README setup can be followed without unstated steps.

### Comparison

Add a table with:

| Pass | Focus | New findings | Fixes made | Residual dependency |
|---|---|---|---|---|

Populate all three rows from the commands and browser checks actually performed. Use “none” for an empty finding or dependency rather than leaving a blank or speculative placeholder.

Commit:

```bash
git add docs/verification/2026-07-27-dynamic-site-verification.md
git commit -m "docs: verify dynamic site operation"
```

## Task 10: Prepare Claude Code critique prompt and final handoff

**Files:**

- Create: `docs/reviews/claude-code-critique-prompt.md`
- Modify: `docs/verification/2026-07-27-dynamic-site-verification.md`

**Step 1: Write a repository-specific critique prompt**

The prompt must ask Claude Code to:

- inspect the actual diff and files, not only the written spec;
- identify design regressions;
- challenge authentication/RLS/storage assumptions;
- test recruitment-mode visibility;
- test cache fallback and detail routing under GitHub Pages base paths;
- find overengineering and unnecessary dependencies;
- rank issues by severity with exact file/line evidence;
- distinguish confirmed bugs from risks and preferences;
- avoid changing code until the user accepts the review.

**Step 2: Final verification**

Run:

```bash
npm test
npm run typecheck
npm run build
git status --short
git diff --check
git log --oneline --decorate -12
```

Do not claim live Supabase or production GitHub Pages success unless those external systems are actually configured and checked.

**Step 3: Commit documentation**

```bash
git add docs/reviews/claude-code-critique-prompt.md docs/verification/2026-07-27-dynamic-site-verification.md
git commit -m "docs: add external critique handoff"
```

## External setup checkpoint

Implementation, local fallback, schema, build, and deploy workflow can be completed without credentials. The following live checks require values the repository must not invent:

- a Supabase project created and owned by the OPT official account, not a member's personal account;
- Supabase project URL;
- Supabase publishable/anon key;
- applied migration;
- an OPT official Auth administrator user and matching `admin_profiles` row;
- GitHub Pages repository settings and Actions variables;
- future `opt.it.kr` DNS ownership.

When these are absent, finish all local work and report the exact remaining one-time operations instead of substituting mock success.
