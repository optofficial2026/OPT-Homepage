# 모집 팝업 및 홈·소개 네비게이션 개편 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 하단 모집 배너를 세션당 1회 모집 팝업으로 전환하고, 관리자 노출 설정과 `홈 / 소개 / 활동기록 / 아카이브` 네비게이션을 제공한다.

**Architecture:** `SiteSettings`에 독립적인 `recruitmentPopupEnabled`를 추가하고 Supabase row 변환·mutation·관리자 폼에 연결한다. HomePage는 로딩 완료 후 `RecruitmentPopup`을 렌더링하며 sessionStorage로 세션당 1회 표시를 보장한다. Vite multi-page 입력에 `intro/index.html`을 추가하고 공통 App shell 안에서 빈 `IntroPage`를 렌더링한다.

**Tech Stack:** React 19, TypeScript, Vite multi-page build, Supabase, Node built-in test runner, native `sessionStorage` and CSS.

## Global Constraints

- 기존 `recruitmentEnabled`는 모집 상태·ticker·hero badge용으로 유지한다.
- 새 `recruitmentPopupEnabled`의 DB 기본값과 fallback 값은 `true`다.
- 팝업은 모집 모드와 팝업 노출 설정이 모두 켜진 홈에서만 자동 표시한다.
- 팝업을 처음 표시할 때 `sessionStorage`에 기록하고, 닫거나 ESC·배경을 누르면 같은 세션에서 다시 열지 않는다.
- 하단 `.recruit-banner`는 DOM에서 제거한다. 기존 거대 공통 stylesheet는 재작성하지 않고, 새 팝업은 이미 있는 `.modal`/`.modal-box` 규칙을 재사용한다.
- 소개 페이지는 공통 네비게이션·footer만 유지하고 본문은 빈 상태로 둔다.
- 새 라이브러리는 추가하지 않는다.

---

### Task 1: Settings contract and migration

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/data/content.ts`
- Modify: `src/lib/content-repository.ts`
- Modify: `src/lib/content-cache.ts`
- Modify: `src/lib/content-mutations.ts`
- Modify: `src/components/HomeEditors.tsx`
- Create: `supabase/migrations/20260816000000_add_recruitment_popup_setting.sql`
- Test: `test/content-model.test.mjs`, `test/content-cache.test.mjs`, `test/homepage.test.mjs`

**Interfaces:**
- `SiteSettings.recruitmentPopupEnabled: boolean`
- `updateSiteSettings(value: SiteSettings)` persists `recruitment_popup_enabled`
- `settingsFromRow` returns `row.recruitment_popup_enabled !== false` so missing/null legacy values remain enabled.

- [x] **Step 1: Write the failing tests**

  Add assertions that the default settings include `recruitmentPopupEnabled: true`, the repository fallback checks the new row field, the mutation writes `recruitment_popup_enabled`, `HomeEditors` renders a `모집 팝업 표시` checkbox, and a legacy content cache fills the new setting from defaults.

- [x] **Step 2: Run the focused tests and verify RED**

  Run `node --test test/content-model.test.mjs test/homepage.test.mjs`.
  Expected: failures identify the missing settings field/mapping/form checkbox.

- [x] **Step 3: Implement the settings contract**

  Extend the type and default object, normalize legacy cached settings with default values, parse the row with a `!== false` fallback, include the boolean in `updateSiteSettings`, and read the checkbox in `SettingsEditor`:

  ```ts
  recruitmentPopupEnabled: form.get('recruitmentPopupEnabled') === 'on',
  ```

  Render the checkbox immediately after `모집 모드 사용` so the two controls are visibly separate.

- [x] **Step 4: Add the additive Supabase migration**

  Create:

  ```sql
  alter table public.site_settings
    add column if not exists recruitment_popup_enabled boolean not null default true;
  ```

- [x] **Step 5: Run focused tests and verify GREEN**

  Run `node --test test/content-model.test.mjs test/homepage.test.mjs`; expected all selected tests pass.

### Task 2: Recruitment popup behavior

**Files:**
- Create: `src/components/RecruitmentPopup.tsx`
- Modify: `src/components/SiteContext.tsx`
- Modify: `src/pages/HomePage.tsx`
- Test: `test/homepage.test.mjs`

**Interfaces:**
- `RecruitmentPopup({ settings, contentLoading }: { settings: SiteSettings; contentLoading: boolean })` renders no DOM when disabled, loading, or already seen.
- `SiteContextValue.contentLoading: boolean` exposes the initial content fetch state so a disabled remote setting does not flash the default popup.

- [x] **Step 1: Write the failing tests**

  Add assertions for the new component, session storage key, close handlers, `contentLoading`, and the absence of the old `recruit-banner` section from `HomePage`.

- [x] **Step 2: Run the focused test and verify RED**

  Run `node --test test/homepage.test.mjs`; expected failures identify missing component, session logic, loading context, and old banner markup.

- [x] **Step 3: Implement the minimal popup**

  In `RecruitmentPopup.tsx`, after `contentLoading` is false and both settings are true, read a fixed key such as `opt-recruitment-popup-seen` from `sessionStorage`. When the popup first opens, record that key so a reload in the same session cannot show it again. Render a native React overlay with `role="dialog"`, `aria-modal="true"`, a close button, recruitment copy, and the existing support URL behavior. Storage writes are wrapped in `try/catch`; clicking the overlay closes it while clicking `.modal-box` stops propagation. Register a `keydown` effect for Escape and clean it up on unmount.

- [x] **Step 4: Connect and style the popup**

  Expose `loading` from `useSiteContent` through `SiteContext`, render `RecruitmentPopup` from `HomePage`, remove the lower recruitment section, and pass the loading state into the popup. Reuse the existing `.modal`/`.modal-box` rules in `styles.css`; add only the blank `.intro-page` layout rule to `src/index.css`.

- [x] **Step 5: Run focused tests and verify GREEN**

  Run `node --test test/homepage.test.mjs`; expected all homepage tests pass.

### Task 3: Home and introduction navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Navigation.tsx`
- Create: `src/pages/IntroPage.tsx`
- Create: `intro/index.html`
- Modify: `vite.config.ts`
- Modify: `src/index.css`
- Test: `test/homepage.test.mjs`

**Interfaces:**
- `Page = 'home' | 'intro' | 'log' | 'archive'`
- `NavigationProps.active` accepts `'intro'` and renders `소개` at `sitePath('/intro/')`.
- `IntroPage` is a no-data page with an empty `main.intro-page` inside the existing App shell.

- [x] **Step 1: Write the failing route tests**

  Assert that `vite.config.ts` includes `intro: 'intro/index.html'`, `intro/index.html` has `data-page="intro"`, App maps `intro` to `IntroPage`, and navigation labels the root link `홈` plus a separate `소개` link.

- [x] **Step 2: Run the focused test and verify RED**

  Run `node --test test/homepage.test.mjs`; expected failures identify the missing route and labels.

- [x] **Step 3: Implement the intro page and route**

  Add the static HTML entry, page type mapping, `IntroPage` with an empty `<main className="intro-page" aria-label="소개" />`, and the navigation links. Keep the common footer, admin toolbar, and site provider unchanged.

- [x] **Step 4: Add minimal blank-page layout support**

  Add a `min-height` rule for `.intro-page` so the shared footer remains at the bottom without introducing placeholder content.

- [x] **Step 5: Run focused tests and verify GREEN**

  Run `node --test test/homepage.test.mjs`; expected all route and navigation assertions pass.

### Task 4: Full verification and handoff

**Files:**
- Modify: none beyond Tasks 1–3
- Possibly apply: linked Supabase project migration

- [x] **Step 1: Run the complete local verification**

  Run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.

- [x] **Step 2: Run local browser smoke checks**

  Verify `/` shows the recruitment modal once, closing it prevents a second modal after reload in the same session, `/intro/` retains navigation/footer with an empty main, and the lower lime recruitment banner is absent.

- [x] **Step 3: Apply the additive Supabase migration**

  Confirm the linked project and authentication state, then run `npx supabase db push` so `recruitment_popup_enabled` exists in the production settings table. If the CLI is not authenticated or no project is linked, report that external deployment dependency instead of changing unrelated Supabase state.

- [ ] **Step 4: Commit the implementation**

  ```bash
  git add src test intro/index.html vite.config.ts supabase/migrations/20260816000000_add_recruitment_popup_setting.sql
  git commit -m "Add recruitment popup and home navigation"
  ```

- [ ] **Step 5: Publish and verify deployment**

  Push `codex/recruitment-popup-home-nav`, open a PR into `main`, wait for the Pages workflow, and verify the deployed home and `/intro/` URLs return HTTP 200 and the deployed bundle contains the popup and `intro` entry.
