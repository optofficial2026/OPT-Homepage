# Timeline Scrollbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 활동 연혁의 기본 스크롤바를 OPT 색상에 맞는 얇은 네온 스크롤바로 교체한다.

**Architecture:** 기존 `.timeline-scroll` 스크롤 컨테이너에 표준 Firefox 속성과 WebKit 전용 pseudo-element 스타일을 추가한다. 컴포넌트 구조, 데이터, 스크롤 동작은 변경하지 않는다.

**Tech Stack:** CSS, Node.js test runner, React/Vite

## Global Constraints

- 연혁 스크롤바 너비는 5px로 제한한다.
- 트랙은 투명하게 유지한다.
- thumb는 청록에서 라임으로 이어지는 색상과 둥근 모서리를 사용한다.
- hover 시 thumb만 더 선명하게 표시한다.
- 다른 스크롤 영역에는 적용하지 않는다.

---

### Task 1: 연혁 전용 네온 스크롤바

**Files:**
- Modify: `src/index.css:21`
- Test: `test/homepage.test.mjs`

**Interfaces:**
- Consumes: `HomePage.tsx`가 사용하는 `.timeline-scroll` 클래스
- Produces: Firefox 및 WebKit 계열 브라우저에서 연혁 영역에만 적용되는 스크롤바 스타일

- [x] **Step 1: 실패하는 CSS 계약 테스트 작성**

`test/homepage.test.mjs`에 아래 테스트를 추가한다.

```js
test('timeline uses a narrow OPT-colored scrollbar without changing other scroll areas', async () => {
  const styles = await read('src/index.css');

  assert.match(styles, /\.timeline-scroll\{[^}]*scrollbar-width:thin/);
  assert.match(styles, /\.timeline-scroll::\-webkit-scrollbar\{width:5px\}/);
  assert.match(styles, /\.timeline-scroll::\-webkit-scrollbar-track\{background:transparent\}/);
  assert.match(styles, /\.timeline-scroll::\-webkit-scrollbar-thumb\{[^}]*linear-gradient\(180deg,var\(--cyan\),var\(--lime\)\)/);
  assert.match(styles, /\.timeline-scroll::\-webkit-scrollbar-thumb:hover\{/);
});
```

- [x] **Step 2: 테스트가 예상대로 실패하는지 확인**

Run: `npm test -- --test-name-pattern="timeline uses a narrow OPT-colored scrollbar"`

Expected: `.timeline-scroll::-webkit-scrollbar` 패턴을 찾지 못해 FAIL

- [x] **Step 3: 최소 CSS 구현**

`src/index.css`에서 기존 `.timeline-scroll` 규칙은 유지하고 아래 연혁 전용 규칙을 추가한다.

```css
.timeline-scroll{scrollbar-width:thin;scrollbar-color:var(--cyan) transparent}
.timeline-scroll::-webkit-scrollbar{width:5px}
.timeline-scroll::-webkit-scrollbar-track{background:transparent}
.timeline-scroll::-webkit-scrollbar-thumb{border-radius:999px;background:linear-gradient(180deg,var(--cyan),var(--lime));opacity:.72}
.timeline-scroll::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#79f7ff,#d9f99d)}
```

- [x] **Step 4: 자동 검증**

Run: `npm test`

Expected: 모든 테스트 PASS

Run: `npm run typecheck`

Expected: exit code 0

Run: `npm run build`

Expected: Vite production build 성공

- [x] **Step 5: 변경 커밋**

```bash
git add src/index.css test/homepage.test.mjs docs/superpowers/plans/2026-07-27-timeline-scrollbar.md
git commit -m "style: customize timeline scrollbar"
```
