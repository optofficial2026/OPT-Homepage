# 소개 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 제공된 `OPT About.dc.html`을 참고한 `/intro/` 소개 화면과 KPI를 제거하고 지원 버튼을 은은하게 강조한 홈 히어로를 구현한다.

**Architecture:** `IntroPage.tsx`가 소개 본문과 스크롤 reveal 동작을 소유하고, `src/index.css`의 `.intro-*` 규칙이 참고 화면의 색상·그리드·이미지·곡선 다이어그램을 담당한다. 대표 이미지는 `public/about-hero.png`로 제공하며 `import.meta.env.BASE_URL`을 통해 GitHub Pages의 하위 경로에서도 로드한다. 홈 KPI 마크업·카운터는 `HomePage.tsx`에서 제거하고, 기존 로고와 공통 지원 버튼의 시각 동작은 `src/index.css`에서 조정한다.

**Tech Stack:** React 19, TypeScript, Vite, 기존 CSS 토큰, inline SVG, Node test runner.

## Global Constraints

- 기존 `/intro/` 공통 네비게이션·푸터·관리자 도구·모집 팝업을 유지한다.
- 소개 페이지는 `01 / FABLE`, `02 / HOW WE LEARN`, `03 / WHY "OPT"` 3개 본문 섹션을 포함한다.
- `// JOIN THE DESCENT`, `같이 내려갈 사람을 찾습니다`, `6기 지원하기` 지원 CTA는 소개 페이지에 포함하지 않는다.
- 제공된 `assets/about-hero.png`를 `public/about-hero.png`로 복사해 대표 이미지로 사용한다.
- 소개 전용 스타일은 `.intro-page` 또는 `.intro-*` 접두사를 사용하고 기존 전역 토큰을 재사용한다.
- 900px 이하에서 본문 2열을 1열로, 히어로 이미지는 데스크톱 460px·모바일 280px 높이로 표시한다.
- 새 의존성, 데이터베이스 변경, 관리자 편집 기능, iframe은 추가하지 않는다.
- 홈의 KPI 설정 데이터와 관리자 입력 UI는 유지하고 홈 화면 노출·카운터만 제거한다.
- 모집 팝업은 기존처럼 홈 진입 시 `HomePage`에서만 표시하며, 소개·활동기록·아카이브 라우트로 표시 범위를 확장하지 않는다.
- 공통 상단 지원 버튼의 링크·비활성 동작은 유지하고 `.recruitment-cta` 글로우만 추가한다.
- 지원 버튼 모션은 3초 이상 주기의 저강도 글로우이며 `prefers-reduced-motion: reduce`에서 정지한다.
- 구현 전에 테스트를 먼저 작성하고 `npm test`에서 새 테스트가 실패하는 것을 확인한다.

---

### Task 1: 소개 페이지 요구사항을 고정하는 실패 테스트 작성

**Files:**
- Modify: `test/homepage.test.mjs`

**Interfaces:**
- Consumes: 현재 `src/pages/IntroPage.tsx`의 파일 텍스트
- Produces: 소개 페이지의 구조·문구·대표 이미지·지원 CTA 제외를 검증하는 테스트

- [ ] **Step 1: Write the failing test**

`test/homepage.test.mjs`에 다음 두 테스트를 추가한다.

```js
test('intro page follows the supplied about design without an intro recruitment CTA', async () => {
  const intro = await read('src/pages/IntroPage.tsx');

  for (const label of ['// ABOUT OPT', '01 / FABLE', '02 / HOW WE LEARN', '03 / WHY "OPT"']) {
    assert.match(intro, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  for (const copy of ['느리지만 멈추지 않고,', 'Global Optimum', '토끼와 거북이', '한 걸음씩', '더 깊게', 'Local이 아닌', 'Global로', '모델의 원리', '수학적 기반', '데이터', '구현 과정']) {
    assert.match(intro, new RegExp(copy));
  }
  assert.match(intro, /about-hero\.png/);
  assert.match(intro, /import\.meta\.env\.BASE_URL/);
  assert.match(intro, /<svg/);
  assert.match(intro, /LOCAL OPTIMUM/);
  assert.match(intro, /GLOBAL OPTIMUM/);
  assert.doesNotMatch(intro, /JOIN THE DESCENT/);
  assert.doesNotMatch(intro, /같이 내려갈 사람을 찾습니다/);
  assert.doesNotMatch(intro, /6기 지원하기/);
});

test('home removes KPI cards, centers the hero logo, and gently emphasizes recruitment', async () => {
  const [home, navigation, styles] = await Promise.all([
    read('src/pages/HomePage.tsx'),
    read('src/components/Navigation.tsx'),
    read('src/index.css'),
  ]);

  assert.doesNotMatch(home, /className="stats"/);
  assert.doesNotMatch(home, /data-count=/);
  assert.doesNotMatch(home, /const counter = new IntersectionObserver/);
  assert.match(home, /className="hero-logo"/);
  assert.match(navigation, /className="button primary recruitment-cta"/);
  assert.match(styles, /\.recruitment-cta\{/);
  assert.match(styles, /recruitment-cta-pulse/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
  assert.match(styles, /\.hero-logo\{[^}]*top:50%[^}]*transform:translateY\(-50%\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: 기존 테스트는 통과하지만 새 두 테스트가 각각 소개 레이블 또는 `className="stats"`를 찾지 못해 실패한다. 현재 소개 페이지가 빈 `<main>`이고 홈에는 KPI 마크업이 있기 때문이다.

- [ ] **Step 3: Commit**

```bash
git add test/homepage.test.mjs
git commit -m "test: define supplied intro page structure"
```

### Task 2: 참고 디자인을 소개 페이지에 구현

**Files:**
- Create: `public/about-hero.png` (copy from `/Users/sonseongwon/Downloads/Design system 적용 방안 (1)/assets/about-hero.png`)
- Modify: `src/pages/IntroPage.tsx`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/components/Navigation.tsx`
- Modify: `src/index.css`
- Modify: `test/homepage.test.mjs`

**Interfaces:**
- Consumes: Task 1의 정적 구조 테스트, 기존 CSS 토큰·`wrap`·`reveal` 패턴, 공통 `App` 셸
- Produces: 공통 셸 안에서 렌더링되는 소개 본문, 반응형 레이아웃, 접근 가능한 inline SVG 곡선, KPI가 제거된 홈 히어로, 저강도 동적 지원 버튼

- [ ] **Step 1: Add the supplied hero asset**

```bash
mkdir -p public
cp "/Users/sonseongwon/Downloads/Design system 적용 방안 (1)/assets/about-hero.png" public/about-hero.png
```

확인: `file public/about-hero.png`가 PNG 파일임을 출력하고, 이미지 크기는 1536 x 1024여야 한다.

- [ ] **Step 2: Implement the React page**

`IntroPage.tsx`에 다음 동작을 구현한다.

```tsx
import { useEffect } from 'react';

const depth = ['모델의 원리', '수학적 기반', '데이터', '구현 과정'];

export default function IntroPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.intro-page .reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const heroImage = `${import.meta.env.BASE_URL}about-hero.png`;

  return <main className="intro-page" aria-label="소개">
    <section className="intro-hero">
      <div className="intro-glow intro-glow-lime" aria-hidden="true" />
      <div className="intro-glow intro-glow-cyan" aria-hidden="true" />
      <div className="wrap intro-wrap">
        <p className="intro-kicker reveal">// ABOUT OPT</p>
        <h1 className="reveal">느리지만 멈추지 않고,<br /><span>Global Optimum</span>을 향해</h1>
        <p className="intro-lede reveal">AI를 배우고, 토론하고, 기록하는 인공지능 학술 동아리 OPT가 공부를 대하는 방식.</p>
        <figure className="intro-hero-media reveal">
          <img src={heroImage} alt="푸른 곡선을 따라 나아가는 토끼와 거북이" />
          <div className="intro-hero-overlay" aria-hidden="true" />
          <figcaption><strong>DESCENDING TOWARD GLOBAL OPTIMUM</strong><span>OPT · 토끼와 거북이</span></figcaption>
        </figure>
      </div>
    </section>
    <section className="wrap intro-section"><div className="intro-two"><div className="reveal"><p className="intro-section-label">01 / FABLE</p><h2>토끼와<br />거북이</h2></div><div className="intro-section-copy reveal"><p>'토끼와 거북이'에서 토끼는 빠르게 앞서가지만 중간에 멈춰 섭니다. 반면, 거북이는 느리지만 멈추지 않고 계속해서 나아가 결국 경주에서 승리합니다.</p></div></div></section>
    <section className="wrap intro-section"><div className="intro-two"><div className="reveal"><p className="intro-section-label">02 / HOW WE LEARN</p><h2>한 걸음씩<br />더 깊게</h2></div><div className="intro-section-copy reveal"><p>OPT는 AI를 단순히 유행하는 기술의 소비만으로 바라보지 않습니다. 우리는 <strong>모델의 원리</strong>, <strong>수학적 기반</strong>, <strong>데이터와 구현 과정</strong>을 함께 공부하며 한 걸음씩 더 깊게 내려갑니다.</p><div className="intro-tags">{depth.map((item) => <span key={item}>{item}</span>)}</div></div></div></section>
    <section className="wrap intro-section intro-section-last"><div className="intro-two"><div className="reveal"><p className="intro-section-label">03 / WHY "OPT"</p><h2>Local이 아닌<br />Global로</h2></div><div className="intro-section-copy"><p className="reveal">Optimization에서 <strong>Local Optimum</strong>은 가까운 곳에서 찾은 그럴듯한 해답이고, <strong className="intro-lime">Global Optimum</strong>은 우리가 도달 가능한 가장 좋은 해답입니다. 토끼가 가까운 Local Optimum에 만족해 멈춰 있을 때, 우리는 거북이처럼 차근차근 더 깊이 탐구하며 더 좋은 해답을 찾아갑니다.</p><div className="intro-curve-card reveal"><svg viewBox="0 0 640 240" role="img" aria-labelledby="intro-curve-title intro-curve-description"><title id="intro-curve-title">Local Optimum에서 Global Optimum으로 내려가는 손실 곡선</title><desc id="intro-curve-description">토끼가 멈춘 Local Optimum보다 더 낮은 Global Optimum을 향해 곡선이 내려간다.</desc><path d="M20 40 C 90 40, 110 128, 180 128 C 230 128, 240 96, 285 96 C 340 96, 360 208, 440 208 C 520 208, 560 90, 620 60" fill="none" stroke="#d9f99d" strokeWidth="2.5" strokeLinecap="round" /><line x1="180" y1="128" x2="180" y2="176" stroke="rgba(103,232,249,0.35)" strokeWidth="1" strokeDasharray="3 4" /><circle cx="180" cy="128" r="7" fill="#67e8f9" /><text x="180" y="196" textAnchor="middle" fill="#67e8f9" fontFamily="Space Mono,monospace" fontSize="13" fontWeight="700">LOCAL OPTIMUM</text><text x="180" y="214" textAnchor="middle" fill="#5c6274" fontFamily="Noto Sans KR,sans-serif" fontSize="12">토끼가 멈춘 곳</text><circle cx="440" cy="208" r="8" fill="#d9f99d" /><text x="440" y="236" textAnchor="middle" fill="#d9f99d" fontFamily="Space Mono,monospace" fontSize="13" fontWeight="700">GLOBAL OPTIMUM</text><text x="330" y="52" fill="#5c6274" fontFamily="Space Mono,monospace" fontSize="11" letterSpacing="1">LOSS ↓ · 깊이 내려갈수록 더 좋은 해답</text></svg></div><div className="intro-quote reveal"><p>처음에는 느려 보여도, 꾸준히 내려가다 보면<br /><span>Global Optimum에 가까워질 수 있다고 믿습니다.</span></p></div></div></div></section>
  </main>;
}
```

대표 이미지의 `src`는 `heroImage`, `alt`는 `푸른 곡선을 따라 나아가는 토끼와 거북이`로 한다. 마지막 본문 뒤에는 지원 CTA 섹션을 만들지 않는다.

`HomePage.tsx`에서는 KPI `<div className="stats">`와 이를 위한 숫자 `IntersectionObserver`를 제거한다. `activityCohorts`, `activityPrograms`, `activityMembers` 설정 필드와 관리자 편집 UI는 건드리지 않는다. 데스크톱 홈 로고는 KPI가 있던 왼쪽 영역을 채우도록 `top:50%`, `transform:translateY(-50%) rotate(3deg)` 기준으로 조정하고 모바일 규칙은 기존 static 배치를 유지한다.

`Navigation.tsx`의 모집 링크와 비활성 버튼 모두에 `recruitment-cta` 클래스를 추가한다. `src/index.css`에 `recruitment-cta-pulse`와 외곽 링 keyframe을 추가하되, `prefers-reduced-motion: reduce`에서 해당 애니메이션을 해제한다.

기존 `test/homepage.test.mjs`에서 빈 소개 페이지, KPI 카드·카운터 존재, 정확히 두 클래스인 모집 버튼을 전제로 한 정적 기대값을 현재 요구사항으로 갱신한다. 공통 셸 테스트는 `intro-page`와 `intro-hero`가 존재하는지 확인하고, 모집 버튼 테스트는 `recruitment-cta` 클래스가 추가된 현재 형태를 확인한다. 홈 카피 테스트는 KPI 설정 보존 검증을 Task 1의 계약 assertion에 맡기고 홈 렌더링에서 KPI 마크업·카운터를 요구하지 않도록 한다. 동적 observer 테스트는 reveal observer와 timeline 의존성만 확인한다. 기존 홈 전용 모집 팝업은 `HomePage`에 남긴다.

- [ ] **Step 3: Add scoped styling**

`src/index.css` 마지막에 `.intro-*` 규칙을 추가한다. 다음 값을 유지한다.

```css
.intro-page{background:var(--deep);color:var(--paper);overflow:hidden}
.intro-hero{position:relative;overflow:hidden;border-bottom:1px solid rgba(217,249,157,.1)}
.intro-hero-media{position:relative;height:460px;overflow:hidden;border:1px solid rgba(217,249,157,.22);border-radius:26px;box-shadow:0 0 70px rgba(217,249,157,.1)}
.intro-hero-media img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}
.intro-two{display:grid;grid-template-columns:300px minmax(0,1fr);gap:56px;align-items:start}
.intro-section-copy{max-width:760px;color:var(--subtle);font-size:19px;line-height:1.85}
.intro-curve-card{border:1px solid rgba(217,249,157,.2);border-radius:22px;padding:36px 32px 24px;background:rgba(217,249,157,.02)}
@media(max-width:900px){.intro-two{grid-template-columns:1fr;gap:28px}.intro-hero-media{height:280px}}
@media(max-width:760px){.intro-hero h1{font-size:44px}.intro-hero-media{height:280px;border-radius:18px}.intro-section-copy{font-size:17px}.intro-curve-card{padding:22px 14px 14px}}
```

이 규칙을 기반으로 참고 HTML의 Space Mono 레이블, 라임·시안 강조색, 히어로 글로우, 이미지 오버레이 캡션, 태그, 인용문, SVG 라벨을 구현한다. 기존 전역 `.reveal`과 `prefers-reduced-motion` 규칙은 그대로 재사용한다. 홈 로고와 지원 CTA는 다음 추가 규칙을 사용한다.

```css
@media(min-width:761px){.hero-content{min-height:calc(100svh - 112px)}.hero-logo{top:50%;transform:translateY(-50%) rotate(3deg);width:min(34vw,420px)}}
.recruitment-cta{position:relative;isolation:isolate;animation:recruitment-cta-pulse 3.6s ease-in-out infinite}
.recruitment-cta::before{position:absolute;inset:-5px;border:1px solid rgba(217,249,157,.35);border-radius:15px;content:'';pointer-events:none;animation:recruitment-cta-ring 3.6s ease-out infinite}
@keyframes recruitment-cta-pulse{50%{box-shadow:0 0 28px rgba(217,249,157,.5)}}
@keyframes recruitment-cta-ring{0%,100%{opacity:0;transform:scale(.96)}35%{opacity:.55}70%{opacity:0;transform:scale(1.08)}}
@media(prefers-reduced-motion:reduce){.recruitment-cta,.recruitment-cta::before{animation:none}}
```

- [ ] **Step 4: Run focused tests to verify it passes**

Run: `npm test`

Expected: 새 소개 테스트를 포함해 전체 테스트가 통과한다.

- [ ] **Step 5: Commit**

```bash
git add public/about-hero.png src/pages/IntroPage.tsx src/pages/HomePage.tsx src/components/Navigation.tsx src/index.css
git commit -m "feat: build reference intro page"
```

### Task 3: 전체 검증과 실제 화면 확인

**Files:**
- Verify: `src/pages/IntroPage.tsx`, `src/index.css`, `public/about-hero.png`

**Interfaces:**
- Consumes: Task 2의 구현 커밋
- Produces: 테스트·타입·빌드·로컬 브라우저 화면에 대한 검증 결과

- [ ] **Step 1: Run the full verification commands**

```bash
npm test
npm run typecheck
npm run build
git diff --check
```

각 명령은 종료 코드 0이어야 한다.

- [ ] **Step 2: Check the local route**

```bash
npm run dev -- --host 127.0.0.1
```

브라우저에서 `/intro/`를 열고 다음을 확인한다.

- 공통 상단 네비와 하단 푸터가 유지된다.
- 히어로 이미지와 캡션이 보인다.
- 세 개의 본문 섹션과 네 개의 깊이 태그가 보인다.
- Local/Global Optimum 곡선과 강조 문장이 보인다.
- 소개 본문에 `6기 지원하기`나 `JOIN THE DESCENT`가 보이지 않는다.
- 홈 첫 화면에 KPI 숫자 카드가 없고, 로고가 왼쪽 빈 영역을 채운다.
- 홈 상단 `2기 지원` 버튼이 `recruitment-cta` 시각 효과를 갖되 빠른 깜빡임이 없다.
- 760px 이하 화면에서 본문이 1열이고 가로 스크롤이 없다.

- [ ] **Step 3: Record the verification result**

변경 파일, 테스트 수, 빌드 결과, 브라우저 확인 결과를 작업 보고에 남기고 PR 전에 `git status --short`로 의도하지 않은 파일이 없는지 확인한다.
