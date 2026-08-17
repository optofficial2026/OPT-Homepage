import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { defaultContent } from '../src/data/content.ts';

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
  const [home, intro, log, archive] = await Promise.all([
    read('index.html'), read('intro/index.html'), read('log/index.html'), read('archive/index.html'),
  ]);

  for (const [html, page] of [[home, 'home'], [intro, 'intro'], [log, 'log'], [archive, 'archive']]) {
    assert.match(html, new RegExp(`<body[^>]*data-page="${page}"`));
    assert.match(html, /<div id="root"><\/div>/);
    assert.match(html, /src="\/src\/main\.tsx"/);
  }
});

test('every route ships a link preview card', async () => {
  const routes = [['index.html', '/'], ['intro/index.html', '/intro/'], ['log/index.html', '/log/'], ['archive/index.html', '/archive/']];

  assert.equal(await exists('public/og.png'), true);
  for (const [file, path] of routes) {
    const html = await read(file);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    assert.match(html, /<meta property="og:title" content="[^"]+"/);
    assert.match(html, /<meta property="og:description" content="[^"]+"/);
    // Kakao and Slack only fetch absolute image URLs, never a relative one.
    assert.match(html, /<meta property="og:image" content="https:\/\/[^"]+\/og\.png"/);
    assert.match(html, new RegExp(`<meta property="og:url" content="https://[^"]+${path}"`));
  }
});

test('recruitment popup visibility is part of the editable site settings contract', async () => {
  const [content, repository, mutations, editor, migration] = await Promise.all([
    read('src/data/content.ts'),
    read('src/lib/content-repository.ts'),
    read('src/lib/content-mutations.ts'),
    read('src/components/HomeEditors.tsx'),
    read('supabase/migrations/20260816000000_add_recruitment_popup_setting.sql'),
  ]);

  assert.equal(defaultContent.settings.recruitmentPopupEnabled, true);
  assert.match(content, /recruitmentPopupEnabled: true/);
  assert.match(repository, /recruitmentPopupEnabled: row\.recruitment_popup_enabled !== false/);
  assert.match(mutations, /recruitment_popup_enabled: value\.recruitmentPopupEnabled/);
  assert.match(editor, /recruitmentPopupEnabled: form\.get\('recruitmentPopupEnabled'\) === 'on'/);
  assert.match(editor, /name="recruitmentPopupEnabled"/);
  assert.match(editor, /모집 팝업 표시/);
  assert.match(migration, /add column if not exists recruitment_popup_enabled boolean not null default true/);
});

test('home and intro routes keep the shared shell with a populated introduction page', async () => {
  const [vite, app, navigation, intro] = await Promise.all([
    read('vite.config.ts'),
    read('src/App.tsx'),
    read('src/components/Navigation.tsx'),
    read('src/pages/IntroPage.tsx'),
  ]);

  assert.match(vite, /intro: 'intro\/index\.html'/);
  assert.match(app, /IntroPage/);
  assert.match(app, /intro: IntroPage/);
  assert.match(navigation, /href=\{sitePath\('\/'\)\}>홈<\/a>/);
  assert.match(navigation, /href=\{sitePath\('\/intro\/'\)\}>소개<\/a>/);
  assert.match(intro, /<main className="intro-page" aria-label="소개">/);
  assert.match(intro, /<section className="intro-hero">/);
});

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

test('intro and activity layouts keep wide content inside the mobile viewport', async () => {
  const styles = await read('src/index.css');

  assert.match(styles, /\.intro-two>\*\{min-width:0\}/);
  assert.match(styles, /\.intro-curve-card\{[^}]*max-width:100%/);
  assert.match(styles, /\.log-card\{min-width:0\}/);
});

test('home removes KPI cards, centers the hero logo, and gently emphasizes recruitment', async () => {
  const [home, navigation, styles, content, editor] = await Promise.all([
    read('src/pages/HomePage.tsx'),
    read('src/components/Navigation.tsx'),
    read('src/index.css'),
    read('src/data/content.ts'),
    read('src/components/HomeEditors.tsx'),
  ]);

  for (const field of ['activityCohorts', 'activityMembers', 'activityPrograms']) {
    assert.match(content, new RegExp(`${field}:`));
    assert.match(editor, new RegExp(`name="${field}"`));
  }
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

test('recruitment popup opens on every home visit, stays home-only, and the old home banner is removed', async () => {
  const [app, popup, home, context] = await Promise.all([
    read('src/App.tsx'),
    read('src/components/RecruitmentPopup.tsx'),
    read('src/pages/HomePage.tsx'),
    read('src/components/SiteContext.tsx'),
  ]);

  assert.match(popup, /contentLoading/);
  assert.doesNotMatch(popup, /opt-recruitment-popup-seen/);
  assert.doesNotMatch(popup, /sessionStorage/);
  assert.match(popup, /setOpen\(true\)/);
  assert.match(popup, /role="dialog"/);
  assert.match(popup, /aria-modal="true"/);
  assert.match(popup, /event\.key === 'Escape'/);
  assert.match(popup, /stopPropagation/);
  assert.match(home, /<RecruitmentPopup/);
  assert.doesNotMatch(app, /RecruitmentPopup/);
  assert.doesNotMatch(home, /id="recruit"/);
  assert.doesNotMatch(home, /recruit-banner/);
  assert.match((await read('src/components/Navigation.tsx')), /settings\.recruitmentFormUrl\s*\?/);
  assert.match((await read('src/components/Navigation.tsx')), /type="button" disabled/);
  assert.match(context, /contentLoading/);
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

  assert.match(data, /export const defaultContent/);
  assert.ok(defaultContent.activities.length > 0);
  assert.ok(defaultContent.timeline.length > 0);
  assert.ok(defaultContent.archives.some(({ kind }) => kind === 'seminar'));
  assert.ok(defaultContent.archives.some(({ kind }) => kind === 'hackathon'));
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

  assert.ok(defaultContent.activities.every(({ cohort }) => cohort === 1));
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
  assert.doesNotMatch(home, /recruit-banner/);
  assert.match(navigation, /className="button primary recruitment-cta"/);
  assert.match(styles, /\.nav-links \.button\{/);
  assert.match(styles, /\.nav-links a:not\(\.active\)\{display:inline-block/);
  assert.match(styles, /:focus-visible/);
  assert.match(app, /활동 기록은 계속 업데이트됩니다/);
  assert.doesNotMatch(app, /INSTAGRAM/);
  assert.match(archive, /자세히 보기/);
  assert.doesNotMatch(archive, /GITHUB ↗/);
});

test('timeline uses a narrow OPT-colored scrollbar without changing other scroll areas', async () => {
  const styles = await read('src/index.css');

  assert.match(styles, /\.timeline-scroll\{[^}]*scrollbar-width:thin/);
  assert.match(styles, /\.timeline-scroll::\-webkit-scrollbar\{width:5px\}/);
  assert.match(styles, /\.timeline-scroll::\-webkit-scrollbar-track\{background:transparent\}/);
  assert.match(styles, /\.timeline-scroll::\-webkit-scrollbar-thumb\{[^}]*linear-gradient\(180deg,var\(--cyan\),var\(--lime\)\)/);
  assert.match(styles, /\.timeline-scroll::\-webkit-scrollbar-thumb:hover\{/);
});

test('detail typography and sections use a restrained editorial scale', async () => {
  const styles = await read('src/index.css');
  assert.match(styles, /\.detail-hero h1,.hack-detail-hero h1\{[^}]*clamp\(40px,6vw,72px\)/);
  assert.match(styles, /\.detail-section\{[^}]*border-top:/);
  assert.match(styles, /\.detail-section h2\{[^}]*clamp\(26px,3\.5vw,40px\)/);
  assert.match(styles, /\.detail-section-body\{[^}]*line-height:1\.8/);
  assert.match(styles, /\.gallery-upload-grid\{/);
});

test('home reflects OPT second-generation recruiting and study-first messaging', async () => {
  const [app, content, home, popup, navigation, styles] = await Promise.all([
    read('src/App.tsx'),
    read('src/data/content.ts'),
    read('src/pages/HomePage.tsx'),
    read('src/components/RecruitmentPopup.tsx'),
    read('src/components/Navigation.tsx'),
    read('src/index.css'),
  ]);

  assert.match(home, /opt 로고 거북이 화이트 모드\.png/);
  assert.match(home, /className="hero-logo/);
  assert.match(home, /settings\.recruitmentCohort.*기 부원 모집 중/);
  assert.match(home, /피드백으로 성장/);
  assert.doesNotMatch(home, /결과물로 확장/);
  assert.match(home, /주제는 당일 공개/);
  assert.match(popup, /AI를 공부하고 싶은데 막막한 당신/);
  assert.doesNotMatch(popup, /친숙해지고/);
  assert.match(popup, /<button className="button dark" type="button" disabled>지원하기<\/button>/);
  assert.match(app, /settings\.recruitmentCohort.*기 부원 모집 중/);
  assert.match(content, /2026\.09/);
  assert.match(navigation, /settings\.recruitmentCohort.*기 지원/);
  assert.match(styles, /\.hero h1\{line-height:1\.02/);
});

test('home reflects the confirmed OPT identity and second-cohort recruiting copy', async () => {
  const [app, content, home, popup, navigation, styles] = await Promise.all([
    read('src/App.tsx'),
    read('src/data/content.ts'),
    read('src/pages/HomePage.tsx'),
    read('src/components/RecruitmentPopup.tsx'),
    read('src/components/Navigation.tsx'),
    read('src/index.css'),
  ]);

  assert.match(home, /opt 로고 거북이 화이트 모드\.png/);
  assert.match(home, /className="hero-logo/);
  assert.match(home, /시행착오를 거치며 우리의 문제를 최적화해 나갑니다/);
  assert.match(home, /대학생, 현직자, 연구원이 함께 모여/);
  assert.match(home, /피드백/);
  assert.match(home, /발표자는 주제를 깊이 있게 숙지하고/);
  assert.match(home, /\['📖', 'STUDY'/);
  assert.match(home, /\['🎙', 'SEMINAR'/);
  assert.match(home, /당일 공개/);
  assert.match(popup, /button className="button dark" type="button" disabled/);
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
  assert.match(styles, /@media\(min-width:761px\)\{\.hero-content\{min-height:calc\(100svh - 112px\);padding-left:min\(40vw,500px\)/);
});

test('uses dark logo variants in navigation and footer and white logo in hero', async () => {
  const [app, home, navigation, styles] = await Promise.all([
    read('src/App.tsx'),
    read('src/pages/HomePage.tsx'),
    read('src/components/Navigation.tsx'),
    read('src/index.css'),
  ]);

  assert.equal(await exists('opt 로고 거북이 다크모드.png'), true);
  assert.equal(await exists('opt 로고 거북이 화이트 모드.png'), true);
  assert.match(navigation, /opt 로고 거북이 다크모드\.png/);
  assert.match(navigation, /src=\{optLogo\}/);
  assert.match(app, /opt 로고 거북이 다크모드\.png/);
  assert.match(app, /className="footer-logo"/);
  assert.match(home, /opt 로고 거북이 화이트 모드\.png/);
  assert.match(home, /src=\{optLogo\}/);
  assert.match(styles, /\.brand-mark\{[^}]*overflow:hidden[^}]*border-radius:14px/);
  assert.match(styles, /\.brand-mark img\{[^}]*object-fit:contain/);
  assert.match(styles, /\.footer-logo\{[^}]*overflow:hidden[^}]*border-radius:14px/);
  assert.match(styles, /\.hero-logo\{[^}]*overflow:hidden[^}]*border-radius:28px/);
});

test('recruitment copy, modal CTA layout, and editor link wiring remain available', async () => {
  const [popup, styles, editor, mutations, repository] = await Promise.all([
    read('src/components/RecruitmentPopup.tsx'),
    read('src/index.css'),
    read('src/components/HomeEditors.tsx'),
    read('src/lib/content-mutations.ts'),
    read('src/lib/content-repository.ts'),
  ]);

  assert.match(popup, /AI를 공부하고 싶은데 막막한 당신/);
  assert.doesNotMatch(popup, /친숙해지고/);
  assert.match(styles, /\.modal-box\{[^}]*text-align:center/);
  assert.match(styles, /\.modal-actions\{[^}]*justify-content:center/);
  assert.match(styles, /recruitment-popup-cta/);
  assert.match(editor, /name="recruitmentFormUrl"/);
  assert.match(editor, /recruitmentFormUrl: String\(form\.get\('recruitmentFormUrl'\)\)/);
  assert.match(mutations, /recruitment_form_url: value\.recruitmentFormUrl/);
  assert.match(repository, /recruitmentFormUrl: String\(row\.recruitment_form_url/);
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

test('home observers are recreated when dynamic content changes', async () => {
  const home = await read('src/pages/HomePage.tsx');
  assert.match(home, /const timelineRef = useRef<HTMLDivElement>\(null\);/);
  assert.match(home, /const sortedTimeline = sortTimelineNewestFirst\(content\.timeline\);/);
  assert.match(home, /document\.querySelectorAll\('\.reveal'\)\.forEach\(\(element\) => reveal\.observe\(element\)\);/);
  assert.match(home, /return \(\) => \{ reveal\.disconnect\(\); \};\n  \}, \[content\.timeline\]\);/);
  assert.match(home, /timelineRef\.current\.scrollTop = 0; \}, \[content\.timeline\]\);/);
  assert.doesNotMatch(home, /const counter = new IntersectionObserver/);
});

test('seminar material format can be edited and is shown in the archive list', async () => {
  const editor = await read('src/components/ArchiveEditor.tsx');
  const archive = await read('src/pages/ArchivePage.tsx');
  assert.match(editor, /name="format"/);
  assert.match(archive, /detail as SeminarDetail\)\.format \?\? 'SLIDE'/);
});

test('the archive resource section is named after activities, not seminars', async () => {
  const [archive, editor, detail] = await Promise.all([
    read('src/pages/ArchivePage.tsx'),
    read('src/components/ArchiveEditor.tsx'),
    read('src/pages/SeminarDetailPage.tsx'),
  ]);

  assert.match(archive, /<h2>활동 자료<\/h2>/);
  assert.match(archive, />활동 자료 추가</);
  assert.match(editor, /'해커톤' : '활동 자료'/);
  assert.doesNotMatch(archive, /세미나 자료|세미나 추가/);
  assert.doesNotMatch(detail, /세미나/);
});

test('activity resources upload files without asking for photos', async () => {
  const editor = await read('src/components/ArchiveEditor.tsx');
  const seminarBranch = editor.slice(editor.indexOf("{kind === 'seminar' ? <>"), editor.indexOf('</> : <>'));

  // 활동 자료 폼에는 사진 관련 입력이 남아 있으면 안 된다.
  for (const gone of ['heroImageUrl', 'galleryUrls', 'thumbnailUrl', 'name="body"']) {
    assert.doesNotMatch(seminarBranch, new RegExp(gone));
  }
  assert.match(seminarBranch, /SeminarResourcesField/);
  assert.match(seminarBranch, /name="format"/);
  // 썸네일 입력이 사라진 뒤에도 저장이 빈 값으로 안전하게 넘어가야 한다.
  assert.match(editor, /form\.get\('thumbnailUrl'\) \?\? ''/);
});

test('seminar details present descriptive resource cards instead of a generic link', async () => {
  const detail = await read('src/pages/SeminarDetailPage.tsx');
  assert.match(detail, /visibleSeminarResources/);
  assert.match(detail, /resourceAction/);
  assert.match(detail, /aria-label/);
  assert.doesNotMatch(detail, />자료 보기 ↗</);
});

test('all detail pages keep section headings and pending copy for empty content', async () => {
  const [activity, seminar, hackathon, section, gallery] = await Promise.all([
    read('src/pages/ActivityDetailPage.tsx'),
    read('src/pages/SeminarDetailPage.tsx'),
    read('src/pages/HackathonDetailPage.tsx'),
    read('src/components/DetailSection.tsx'),
    read('src/components/MediaGallery.tsx'),
  ]);
  assert.match(section, /준비 중입니다\./);
  for (const heading of ['활동 내용', '활동 사진']) assert.match(activity, new RegExp(heading));
  // 활동 자료는 자료 목록만 남기고 본문·사진 구역을 걷어냈다.
  assert.match(seminar, /관련 자료/);
  for (const gone of ['세미나 내용', '세미나 사진', 'detail-cover', 'MediaGallery']) {
    assert.doesNotMatch(seminar, new RegExp(gone));
  }
  for (const heading of ['문제', '해결', '주요 기능', '프로젝트 화면', '개발 과정', '시스템 구조', '회고', '결과', '기술 스택', '팀']) {
    assert.match(hackathon, new RegExp(heading));
  }
  assert.match(gallery, /slice\(0, MAX_GALLERY_IMAGES\)/);
});

test('content mutations reject writes that affect no rows', async () => {
  const mutations = await read('src/lib/content-mutations.ts');
  assert.match(mutations, /data: unknown\[\] \| null/);
  assert.match(mutations, /if \(!data\?\.length\) throw new Error\('권한이 없거나 대상이 존재하지 않습니다\.'/);
  assert.equal((mutations.match(/\.select\('id'\)/g) ?? []).length, 7);
});

test('replacing a temporary image removes only the previous temporary upload', async () => {
  const field = await read('src/components/ImageUploadField.tsx');
  assert.match(field, /removeMedia\(uploadedUrl\)/);
  assert.match(field, /setUploadedUrl\(nextUrl\)/);
  assert.doesNotMatch(field, /removeMedia\(value\)/);
});

test('gallery image input supports five file previews without exposing URL entry', async () => {
  const field = await read('src/components/GalleryUploadField.tsx');
  assert.match(field, /multiple/);
  assert.match(field, /MAX_GALLERY_IMAGES/);
  assert.match(field, /type="hidden" name=\{name\}/);
  assert.match(field, /removeMedia/);
});

test('all image upload fields advertise the shared ten-megabyte limit', async () => {
  const [single, gallery] = await Promise.all([
    read('src/components/ImageUploadField.tsx'),
    read('src/components/GalleryUploadField.tsx'),
  ]);

  for (const field of [single, gallery]) {
    assert.match(field, /MAX_IMAGE_SIZE_MB/);
    assert.doesNotMatch(field, /5MB/);
  }
});

test('thumbnail uploads crop to the list ratio and editors explain image limits', async () => {
  const [field, activity, archive, log, styles] = await Promise.all([
    read('src/components/ImageUploadField.tsx'),
    read('src/components/ActivityEditor.tsx'),
    read('src/components/ArchiveEditor.tsx'),
    read('src/pages/LogPage.tsx'),
    read('src/index.css'),
  ]);

  assert.match(field, /crop\?: 'thumbnail'/);
  assert.match(field, /thumbnailCropRect/);
  assert.match(activity, /crop="thumbnail"/);
  assert.match(archive, /crop="thumbnail"/);
  assert.match(activity, /장당 10MB 이하/);
  assert.match(archive, /장당 10MB 이하/);
  assert.match(log, /backgroundSize: 'cover'/);
  assert.match(styles, /\.image-slot\{[^}]*aspect-ratio:16\/9/);
});

test('content editors explain image placement and use file-first gallery controls', async () => {
  const [activity, archive] = await Promise.all([
    read('src/components/ActivityEditor.tsx'),
    read('src/components/ArchiveEditor.tsx'),
  ]);
  for (const editor of [activity, archive]) {
    assert.match(editor, /목록 썸네일/);
    assert.match(editor, /상세 대표 이미지/);
    assert.match(editor, /GalleryUploadField/);
    assert.doesNotMatch(editor, /갤러리 URL/);
  }
  assert.match(activity, /고급 설정/);
  assert.match(archive, /고급 설정/);
});

test('losing administrator membership also exits edit mode', async () => {
  const context = await read('src/components/SiteContext.tsx');
  assert.match(context, /const nextIsAdmin = Boolean\(data\);/);
  assert.match(context, /setIsAdmin\(nextIsAdmin\);\n      if \(nextIsAdmin\) setLoginOpen\(false\);\n      if \(!nextIsAdmin\) setEditMode\(false\);/);
});

test('missing remote settings do not discard remote content lists', async () => {
  const repository = await read('src/lib/content-repository.ts');
  assert.match(repository, /from\('site_settings'\)\.select\('\*'\)\.maybeSingle\(\)/);
  assert.match(repository, /settings: settings\.data \? settingsFromRow\(settings\.data\) : defaultContent\.settings/);
});

test('editors protect drafts and wait for uploads before saving', async () => {
  const [activity, archive, home, safety, image, gallery, resources, styles] = await Promise.all([
    read('src/components/ActivityEditor.tsx'),
    read('src/components/ArchiveEditor.tsx'),
    read('src/components/HomeEditors.tsx'),
    read('src/hooks/useEditorSafety.ts'),
    read('src/components/ImageUploadField.tsx'),
    read('src/components/GalleryUploadField.tsx'),
    read('src/components/SeminarResourcesField.tsx'),
    read('src/index.css'),
  ]);

  for (const editor of [activity, archive]) {
    assert.match(editor, /useEditorSafety/);
    assert.match(editor, /pendingUploads > 0/);
    assert.match(editor, /disabled=\{isSaving \|\| pendingUploads > 0\}/);
    assert.match(editor, /className="editor-actions"/);
  }
  assert.equal((home.match(/= useEditorSafety\(close\)/g) ?? []).length, 2);
  assert.equal((home.match(/disabled=\{isSaving\}/g) ?? []).length, 2);
  assert.match(safety, /if \(isSaving \|\| pendingUploads > 0\) return/);
  for (const upload of [image, gallery, resources]) {
    assert.match(upload, /onUploadPendingChange/);
  }
  assert.match(image, /disabled=\{uploading\}/);
  assert.match(styles, /\.editor-actions\{[^}]*position:sticky/);
});

test('seminar resources use separate quick actions for files and external links', async () => {
  const resources = await read('src/components/SeminarResourcesField.tsx');

  assert.match(resources, /PDF 올리기/);
  assert.match(resources, /PPT 올리기/);
  assert.match(resources, /외부 링크 추가/);
  assert.match(resources, />수정</);
  assert.doesNotMatch(resources, /PDF·PPT 파일 직접 올리기/);
});

test('new content receives an automatic slug while existing slugs stay editable', async () => {
  const [activity, archive] = await Promise.all([
    read('src/components/ActivityEditor.tsx'),
    read('src/components/ArchiveEditor.tsx'),
  ]);

  assert.match(activity, /activity-\$\{crypto\.randomUUID\(\)\}/);
  assert.match(archive, /\$\{kind\}-\$\{crypto\.randomUUID\(\)\}/);
  for (const editor of [activity, archive]) {
    assert.match(editor, /type="hidden"/);
    assert.match(editor, /고급 설정/);
  }
});

test('the recruitment banner spells OPT out as Optimizer', async () => {
  const popup = await read('src/components/RecruitmentPopup.tsx');

  assert.match(popup, /OPT \(Optimizer\)는 당신이 목표를 향한 첫발을 내딛도록/);
  assert.doesNotMatch(popup, /Optimal Personal Teacher/);
});

test('the hero headline keeps three lines with OPT as the accented one', async () => {
  const home = await read('src/pages/HomePage.tsx');
  const headline = home.slice(home.indexOf('<h1>'), home.indexOf('</h1>'));

  assert.match(headline, /<span className="reveal">Slow &amp; steady<\/span>/);
  assert.match(headline, /<span className="reveal">Think deep<\/span>/);
  // em 이 라임색 강조를 받는 줄이다.
  assert.match(headline, /<em className="reveal">OPT<\/em>/);
  assert.doesNotMatch(home, /AI를 배우고,/);
});

test('home values drop the lecture framing and the vague closing line', async () => {
  const home = await read('src/pages/HomePage.tsx');

  assert.match(home, /모두 함께 다양한 지식과 관점을 익힙니다/);
  assert.match(home, /피드백을 주고받으며 성장합니다/);
  assert.doesNotMatch(home, /수강자/);
  assert.doesNotMatch(home, /생각을 더 정확하게 다듬습니다/);
});

test('core activity cards lead with the seminar and link into their own activity filter', async () => {
  const [home, log] = await Promise.all([
    read('src/pages/HomePage.tsx'),
    read('src/pages/LogPage.tsx'),
  ]);

  // 세미나가 스터디보다 먼저 나온다.
  assert.ok(home.indexOf("'🎙', 'SEMINAR'") < home.indexOf("'📖', 'STUDY'"));
  assert.match(home, /\$\{sitePath\('\/log\/'\)\}\?tag=\$\{tag\}/);
  // 해커톤은 걸 곳이 없어 링크를 붙이지 않는다.
  assert.match(home, /'해커톤', '배운 이론을[^']*', ''\]/);

  // 활동 기록이 그 필터를 실제로 받아야 링크가 의미를 갖는다.
  assert.match(log, /useState<Filter>\(requestedFilter\)/);
  assert.match(log, /get\('tag'\)/);
  assert.match(log, /includes\(tag\) \? tag as Filter : 'ALL'/);
});

test('intro copy names the club plainly and drops the trailing period on the accent line', async () => {
  const intro = await read('src/pages/IntroPage.tsx');

  assert.match(intro, /AI 연합 학회 OPT가 공부를 대하는 방식</);
  assert.match(intro, /<span>Global Optimum에 가까워질 수 있다고 믿습니다<\/span>/);
  assert.doesNotMatch(intro, /기록하는 인공지능 학술 동아리/);
});
