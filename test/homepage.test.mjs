import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const exists = async (file) => access(new URL(`../${file}`, import.meta.url)).then(() => true, () => false);

test('Vite React scaffold exposes the maintenance scripts and entry point', async () => {
  assert.equal(await exists('package.json'), true);
  assert.equal(await exists('src/main.tsx'), true);

  const packageJson = JSON.parse(await read('package.json'));
  assert.equal(packageJson.scripts.dev, 'vite');
  assert.equal(packageJson.scripts.build, 'vite build');
  assert.equal(packageJson.scripts.test, 'node --test test/*.test.mjs');
});

test('all routes mount the shared React entry with a page marker', async () => {
  const [home, log, archive] = await Promise.all([
    read('index.html'), read('log/index.html'), read('archive/index.html'),
  ]);

  for (const [html, page] of [[home, 'home'], [log, 'log'], [archive, 'archive']]) {
    assert.match(html, new RegExp(`<body[^>]*data-page="${page}"`));
    assert.match(html, /<div id="root"><\/div>/);
    assert.match(html, /src="\/src\/main\.tsx"/);
  }
});

test('React pages own typed content, reveal behavior, and activity filtering', async () => {
  assert.equal(await exists('src/data/content.ts'), true);
  assert.equal(await exists('src/pages/HomePage.tsx'), true);
  assert.equal(await exists('src/pages/LogPage.tsx'), true);
  assert.equal(await exists('src/pages/ArchivePage.tsx'), true);
  assert.equal(await exists('src/components/Navigation.tsx'), true);

  const [data, home, log, archive, navigation] = await Promise.all([
    read('src/data/content.ts'),
    read('src/pages/HomePage.tsx'),
    read('src/pages/LogPage.tsx'),
    read('src/pages/ArchivePage.tsx'),
    read('src/components/Navigation.tsx'),
  ]);

  assert.match(data, /export const activityLog/);
  assert.match(data, /export const timeline/);
  assert.match(data, /export const seminars/);
  assert.match(data, /export const hackathons/);
  assert.match(home, /useEffect/);
  assert.match(log, /content\.activities\.filter/);
  assert.match(archive, /visibleHackathons\.map/);
  assert.match(navigation, /sitePath\('\/log\/'\)/);
});

test('activity log and archive can filter materials by cohort', async () => {
  const [data, log, archive] = await Promise.all([
    read('src/data/content.ts'),
    read('src/pages/LogPage.tsx'),
    read('src/pages/ArchivePage.tsx'),
  ]);

  assert.match(data, /cohort: '1기'/);
  assert.match(log, /cohortFilter/);
  assert.match(log, /item\.cohort/);
  assert.match(archive, /cohortFilter/);
  assert.match(archive, /visibleSeminars/);
  assert.match(archive, /visibleHackathons/);
});

test('TypeScript includes Vite client declarations for CSS imports', async () => {
  assert.equal(await exists('src/vite-env.d.ts'), true);
  assert.match(await read('src/vite-env.d.ts'), /vite\/client/);
});

test('home keeps the recruiting ticker above the sticky navigation', async () => {
  const app = await read('src/App.tsx');
  assert.ok(app.indexOf('className="ticker"') < app.indexOf('<Navigation'));
});

test('sticky navigation is not nested under an overflow container', async () => {
  assert.doesNotMatch(await read('src/App.tsx'), /overflow-x-hidden/);
});

test('visual regressions do not block navigation or advertise unavailable actions', async () => {
  const [app, archive, home, navigation, styles] = await Promise.all([
    read('src/App.tsx'),
    read('src/pages/ArchivePage.tsx'),
    read('src/pages/HomePage.tsx'),
    read('src/components/Navigation.tsx'),
    read('src/index.css'),
  ]);

  assert.doesNotMatch(home, /className="modal"/);
  assert.match(home, /button className="button dark" type="button" disabled/);
  assert.match(navigation, /className="button primary"/);
  assert.match(styles, /\.nav-links \.button\{/);
  assert.match(styles, /\.nav-links a:not\(\.active\)\{display:inline-block/);
  assert.match(styles, /\.recruit-banner h2\{[^}]*word-break:keep-all/);
  assert.match(styles, /:focus-visible/);
  assert.match(app, /활동 기록은 계속 업데이트됩니다/);
  assert.doesNotMatch(app, /INSTAGRAM/);
  assert.match(archive, /자세히 보기/);
  assert.doesNotMatch(archive, /GITHUB ↗/);
});

test('home reflects OPT second-generation recruiting and study-first messaging', async () => {
  const [app, content, home, navigation, styles] = await Promise.all([
    read('src/App.tsx'),
    read('src/data/content.ts'),
    read('src/pages/HomePage.tsx'),
    read('src/components/Navigation.tsx'),
    read('src/index.css'),
  ]);

  assert.match(home, /opt-logo\.png/);
  assert.match(home, /className="hero-logo/);
  assert.match(home, /settings\.recruitmentCohort.*기 부원 모집 중/);
  assert.match(home, /settings\.activityCohorts/);
  assert.match(home, /settings\.activityPrograms/);
  assert.match(home, /settings\.activityMembers/);
  assert.match(home, /피드백으로 성장/);
  assert.doesNotMatch(home, /결과물로 확장/);
  assert.match(home, /주제는 당일 공개/);
  assert.match(home, /AI를 공부하고 친숙해지고 싶지만 막막한 당신/);
  assert.match(home, /<button className="button dark" type="button" disabled>지원하기<\/button>/);
  assert.match(app, /settings\.recruitmentCohort.*기 부원 모집 중/);
  assert.match(content, /2026\.09/);
  assert.match(navigation, /settings\.recruitmentCohort.*기 지원/);
  assert.match(styles, /\.hero h1\{line-height:1\.02/);
});

test('home reflects the confirmed OPT identity and second-cohort recruiting copy', async () => {
  const [app, content, home, navigation, styles] = await Promise.all([
    read('src/App.tsx'),
    read('src/data/content.ts'),
    read('src/pages/HomePage.tsx'),
    read('src/components/Navigation.tsx'),
    read('src/index.css'),
  ]);

  assert.match(home, /opt-logo\.png/);
  assert.match(home, /className="hero-logo/);
  assert.match(home, /settings\.activityCohorts/);
  assert.match(home, /settings\.activityPrograms/);
  assert.match(home, /settings\.activityMembers/);
  assert.match(home, /기술과 논문/);
  assert.match(home, /주도적으로 AI 이론/);
  assert.match(home, /피드백/);
  assert.match(home, /발표자는 주제를 깊이 있게 숙지하고/);
  assert.match(home, /\['📖', 'STUDY'/);
  assert.match(home, /\['🎙', 'SEMINAR'/);
  assert.match(home, /당일 공개/);
  assert.match(home, /button className="button dark" type="button" disabled/);
  assert.match(app, /settings\.recruitmentCohort.*기 부원 모집 중/);
  assert.match(navigation, /settings\.recruitmentCohort.*기 지원/);
  assert.match(navigation, /className="brand-mark"/);
  assert.match(navigation, /aria-label="OPT 홈"/);
  assert.match(content, /2026\.09/);
  assert.match(content, /2기 부원 모집/);
  assert.match(content, /2026년 9월부터 활동 예정입니다/);
  assert.match(content, /2026년 여름방학.*여름방학/);
  assert.match(content, /개별 스터디 모임, 바이브 코딩, AI 공모전 참가/);
  assert.match(content, /전반부.*개념 스터디 4회/);
  assert.match(content, /후반부.*기술 세미나, 논문 세미나, 해커톤/);
  assert.match(content, /2026\.03\.07.*OPT 시작/);
  assert.match(content, /외대 유일의, 그리고 최고의 AI 학회가 되고자 모였습니다/);
  assert.match(styles, /\.hero-logo/);
  assert.match(styles, /\.brand-mark\{/);
  assert.match(styles, /\.hero h1\{line-height:1\.02/);
  assert.match(styles, /@media\(min-width:761px\)\{\.hero-content\{padding-left:min\(40vw,500px\)/);
  assert.match(styles, /\.stats\{position:absolute;top:370px;left:0;width:340px;height:368px;grid-template-columns:1fr/);
});

test('administrator access stays inline and verifies database membership', async () => {
  const [app, context] = await Promise.all([
    read('src/App.tsx'),
    read('src/components/SiteContext.tsx'),
  ]);
  assert.doesNotMatch(app, /\/admin/);
  assert.match(context, /admin_profiles/);
  assert.match(context, /isEditMode/);
  assert.doesNotMatch(context, /email.*admin/i);
});

test('activity and archive records open first-party detail pages', async () => {
  const [log, archive, activityDetail, hackathonDetail] = await Promise.all([
    read('src/pages/LogPage.tsx'),
    read('src/pages/ArchivePage.tsx'),
    read('src/pages/ActivityDetailPage.tsx'),
    read('src/pages/HackathonDetailPage.tsx'),
  ]);
  assert.match(log, /URLSearchParams/);
  assert.match(log, /sitePath\('\/log\/'\)/);
  assert.match(archive, /URLSearchParams/);
  assert.match(archive, /sitePath\('\/archive\/'\)/);
  assert.match(activityDetail, /galleryUrls/);
  for (const section of ['문제', '해결', '주요 기능', '개발 과정', '시스템 구조', '회고', '결과', '기술 스택', '팀']) {
    assert.match(hackathonDetail, new RegExp(section));
  }
});

test('github pages build uses a configurable base and public supabase values only', async () => {
  const [vite, workflow, paths] = await Promise.all([
    read('vite.config.ts'),
    read('.github/workflows/deploy-pages.yml'),
    read('src/lib/paths.ts'),
  ]);
  assert.match(vite, /VITE_SITE_BASE_PATH/);
  assert.match(workflow, /upload-pages-artifact/);
  assert.match(workflow, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(`${vite}\n${workflow}\n${paths}`, /service[_-]?role/i);
});

test('home counter observer is recreated when administrator statistics change', async () => {
  const home = await read('src/pages/HomePage.tsx');
  assert.match(home, /reveal\.disconnect\(\); \};\n  }, \[\]\);\n  useEffect\(\(\) => \{\n    const counter/);
  assert.match(home, /counter\.disconnect\(\); \};\n  }, \[settings\.activityCohorts, settings\.activityPrograms, settings\.activityMembers\]\)/);
});
