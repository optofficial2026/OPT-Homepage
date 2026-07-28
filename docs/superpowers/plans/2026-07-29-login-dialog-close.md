# Login Dialog Close Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공통 인증 경로에서 관리자 권한이 확인되면 열려 있는 로그인 창을 자동으로 닫는다.

**Architecture:** 기존 `SiteProvider`의 `verify` 함수가 인증 사용자와 관리자 권한을 결정하는 단일 경로다. 이 함수가 `nextIsAdmin`을 계산한 직후 관리자일 때만 `setLoginOpen(false)`를 호출한다.

**Tech Stack:** React 19, TypeScript, Supabase Auth, Node test runner

## Global Constraints

- 로그인 폼과 Supabase API 호출은 변경하지 않는다.
- 비관리자 오류와 편집 모드 종료 동작은 유지한다.
- 새 dependency와 별도 상태를 추가하지 않는다.

---

### Task 1: 공통 인증 성공 시 로그인 창 닫기

**Files:**
- Modify: `src/components/SiteContext.tsx`
- Test: `test/homepage.test.mjs`

**Interfaces:**
- Consumes: `nextIsAdmin: boolean`
- Produces: 관리자 확인 성공 시 `setLoginOpen(false)` 호출

- [ ] **Step 1: 실패 테스트 작성**

`test/homepage.test.mjs`의 관리자 상태 테스트에 공통 검증 경로가 관리자일 때 로그인 창을 닫는다는 계약을 추가한다.

```js
assert.match(context, /if \(nextIsAdmin\) setLoginOpen\(false\);/);
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test --test-name-pattern="losing administrator membership" test/homepage.test.mjs`

Expected: 공통 인증 경로에 `setLoginOpen(false)`가 없어 FAIL.

- [ ] **Step 3: 최소 구현**

`SiteContext.tsx`의 `verify` 함수에서 관리자 상태를 갱신한 직후 로그인 창을 닫는다.

```ts
setIsAdmin(nextIsAdmin);
if (nextIsAdmin) setLoginOpen(false);
if (!nextIsAdmin) setEditMode(false);
```

- [ ] **Step 4: 관련 테스트 통과 확인**

Run: `node --test --test-name-pattern="losing administrator membership" test/homepage.test.mjs`

Expected: PASS.

- [ ] **Step 5: 전체 검증**

Run: `pnpm test && pnpm typecheck && pnpm build && git diff --check`

Expected: 테스트 전부 통과, 나머지 명령 exit code 0.
