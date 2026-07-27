# Detail Content and Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 활동·세미나·해커톤 상세 페이지의 정보 위계를 정리하고 관리자가 상세 사진을 최대 5장까지 파일로 관리하게 한다.

**Architecture:** 기존 Supabase `galleryUrls` 배열을 유지하면서 파일 업로드 상태를 담당하는 공용 `GalleryUploadField`와 상세 구역 표시를 담당하는 공용 `DetailSection`을 추가한다. 편집 폼은 숨은 폼 값으로 기존 저장 함수를 그대로 사용하고, 세 상세 페이지는 같은 빈 상태와 타이포그래피 규칙을 공유한다.

**Tech Stack:** React 19, TypeScript, CSS, Supabase Storage, Node.js test runner, Vite

## Global Constraints

- 데이터베이스 마이그레이션과 새 의존성 추가는 하지 않는다.
- 상세 사진은 기존 사진을 포함해 최대 5장이다.
- JPEG, PNG, WebP만 허용하며 사진 한 장은 5MB 이하여야 한다.
- 이미지 URL 직접 입력은 관리자 UI에서 숨긴다.
- 소제목은 콘텐츠 유무와 관계없이 항상 표시한다.
- 빈 콘텐츠는 `준비 중입니다.`로 표시한다.
- 기존 공개 페이지와 관리자 권한 로직은 변경하지 않는다.

---

### Task 1: 최대 5장 상세 사진 업로드

**Files:**
- Modify: `src/lib/media-storage.ts`
- Create: `src/components/GalleryUploadField.tsx`
- Modify: `src/components/ImageUploadField.tsx`
- Test: `test/media-storage.test.mjs`
- Test: `test/homepage.test.mjs`

**Interfaces:**
- Consumes: `uploadMedia(folder: string, file: File): Promise<string>`, `removeMedia(url: string): Promise<void>`
- Produces: `MAX_GALLERY_IMAGES`, `galleryLimitError(currentCount: number, incomingCount: number): string`
- Produces: `<GalleryUploadField name folder value description />`

- [ ] **Step 1: 갤러리 제한 테스트 작성**

`test/media-storage.test.mjs`에 다음 계약을 추가한다.

```js
import {
  MAX_GALLERY_IMAGES,
  galleryLimitError,
  mediaError,
  mediaPathFromUrl,
  safeMediaPath,
} from '../src/lib/media-storage.ts';

test('gallery accepts no more than five images', () => {
  assert.equal(MAX_GALLERY_IMAGES, 5);
  assert.equal(galleryLimitError(2, 3), '');
  assert.match(galleryLimitError(3, 3), /최대 5장/);
});
```

`test/homepage.test.mjs`에는 공용 입력의 다중 선택과 숨은 폼 값을 확인한다.

```js
test('gallery image input supports five file previews without exposing URL entry', async () => {
  const field = await read('src/components/GalleryUploadField.tsx');
  assert.match(field, /multiple/);
  assert.match(field, /MAX_GALLERY_IMAGES/);
  assert.match(field, /type="hidden" name=\{name\}/);
  assert.match(field, /removeMedia/);
});
```

- [ ] **Step 2: 새 테스트의 실패 확인**

Run: `npm test -- --test-name-pattern="gallery accepts|gallery image input"`

Expected: export와 파일이 존재하지 않아 FAIL

- [ ] **Step 3: 갤러리 제한 helper 구현**

`src/lib/media-storage.ts`에 다음을 추가한다.

```ts
export const MAX_GALLERY_IMAGES = 5;

export const galleryLimitError = (currentCount: number, incomingCount: number) =>
  currentCount + incomingCount > MAX_GALLERY_IMAGES
    ? `상세 사진은 최대 ${MAX_GALLERY_IMAGES}장까지 올릴 수 있습니다.`
    : '';
```

- [ ] **Step 4: 다중 이미지 입력 구현**

`GalleryUploadField.tsx`는 다음 상태와 동작을 갖는다.

```tsx
type Props = {
  name: string;
  folder: string;
  value?: string[];
  description: string;
};

const [urls, setUrls] = useState((value ?? []).slice(0, MAX_GALLERY_IMAGES));
const [status, setStatus] = useState('');
const [uploading, setUploading] = useState(false);
const uploadedUrls = useRef(new Set<string>());
```

폼 값과 파일 입력은 다음 구조를 사용한다.

```tsx
<input type="hidden" name={name} value={urls.join('\n')} />
<input
  type="file"
  multiple
  accept="image/jpeg,image/png,image/webp"
  disabled={uploading || urls.length >= MAX_GALLERY_IMAGES}
  onChange={uploadFiles}
/>
```

`uploadFiles`는 현재 개수와 선택 개수를 `galleryLimitError`로 먼저 검사하고, 각 파일을 `uploadMedia`로 순서대로 올린다. 성공한 URL은 즉시 미리보기에 유지하고 실패 메시지는 `status`에 표시한다. 현재 편집에서 새로 업로드한 사진을 삭제할 때만 `removeMedia(url)`를 호출한다.

- [ ] **Step 5: 단일 이미지 입력을 파일 중심 UI로 변경**

`ImageUploadField`에 `description` prop을 추가하고 URL input을 숨은 값으로 바꾼다.

```tsx
<input name={name} type="hidden" value={url} />
{url && <img className="single-upload-preview" src={url} alt="" />}
<small>{description}</small>
<input type="file" accept="image/jpeg,image/png,image/webp" />
{url && <button type="button" onClick={clearImage}>사진 삭제</button>}
```

기존 업로드를 새 파일로 교체할 때 현재 세션에서 업로드한 임시 URL만 삭제하는 동작은 유지한다.

- [ ] **Step 6: Task 1 검증**

Run: `npm test -- --test-name-pattern="gallery accepts|gallery image input|replacing a temporary image"`

Expected: 관련 테스트 PASS

- [ ] **Step 7: Task 1 커밋**

```bash
git add src/lib/media-storage.ts src/components/GalleryUploadField.tsx src/components/ImageUploadField.tsx test/media-storage.test.mjs test/homepage.test.mjs
git commit -m "feat: add five-image gallery uploads"
```

---

### Task 2: 관리자 편집 폼 용어와 안내 개선

**Files:**
- Modify: `src/components/ActivityEditor.tsx`
- Modify: `src/components/ArchiveEditor.tsx`
- Test: `test/homepage.test.mjs`

**Interfaces:**
- Consumes: `GalleryUploadField`, 설명 prop을 받는 `ImageUploadField`
- Produces: 기존 `saveActivityPost`와 `saveArchiveItem`이 소비하는 동일한 폼 필드 이름

- [ ] **Step 1: 관리자 폼 계약 테스트 작성**

```js
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
  assert.match(activity, /주소 이름 \(영문\)/);
  assert.match(archive, /주소 이름 \(영문\)/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- --test-name-pattern="content editors explain"`

Expected: 기존 URL label과 textarea 때문에 FAIL

- [ ] **Step 3: 활동 편집 폼 변경**

- `슬러그`를 `주소 이름 (영문)`으로 변경하고 `paper-reading-1` 예시를 표시한다.
- `요약`을 `목록 요약`으로 변경하고 목록 카드에 표시된다고 안내한다.
- `본문`을 `활동 내용`으로 변경하고 `required`를 제거한다.
- 단일 이미지 label과 설명을 `목록 썸네일`, `상세 대표 이미지`로 변경한다.
- `galleryUrls` textarea를 다음 입력으로 교체한다.

```tsx
<GalleryUploadField
  name="galleryUrls"
  folder="activity"
  value={value?.galleryUrls}
  description="상세 페이지의 ‘활동 사진’에 표시됩니다. 최대 5장입니다."
/>
```

- [ ] **Step 4: 세미나·해커톤 편집 폼 변경**

- 공통 `슬러그`를 `주소 이름 (영문)`으로 바꾸고 예시를 표시한다.
- `목록 요약`, `목록 썸네일`, `상세 대표 이미지`에 노출 위치 설명을 추가한다.
- 세미나 `본문`을 `세미나 내용`으로 변경하고 `required`를 제거한다.
- 두 종류의 `galleryUrls` textarea를 `GalleryUploadField`로 교체한다.
- `자료 링크`는 `관련 자료 링크`로 바꾸고 PDF·Google Drive·Notion 등 새 창으로 열 주소라고 설명한다.
- GitHub·데모·발표 자료 URL은 각각 어떤 버튼으로 표시되는지 설명한다.
- 폼 구역은 `기본 정보`, `목록 이미지`, `상세 페이지`, `관련 링크` fieldset으로 묶는다.

- [ ] **Step 5: Task 2 검증**

Run: `npm test -- --test-name-pattern="content editors explain|seminar material format"`

Expected: 관련 테스트 PASS

- [ ] **Step 6: Task 2 커밋**

```bash
git add src/components/ActivityEditor.tsx src/components/ArchiveEditor.tsx test/homepage.test.mjs
git commit -m "feat: clarify content editor fields"
```

---

### Task 3: 항상 보이는 상세 콘텐츠 구역

**Files:**
- Create: `src/components/DetailSection.tsx`
- Modify: `src/components/MediaGallery.tsx`
- Modify: `src/pages/ActivityDetailPage.tsx`
- Modify: `src/pages/SeminarDetailPage.tsx`
- Modify: `src/pages/HackathonDetailPage.tsx`
- Test: `test/homepage.test.mjs`

**Interfaces:**
- Produces: `<DetailSection eyebrow title empty>{children}</DetailSection>`
- Consumes: `MediaGallery`가 최대 5장으로 제한한 이미지 배열

- [ ] **Step 1: 상세 구역 회귀 테스트 작성**

기존 `public hackathon details hide empty administrator sections` 테스트를 다음 계약으로 교체한다.

```js
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
  for (const heading of ['세미나 내용', '세미나 사진', '관련 자료']) assert.match(seminar, new RegExp(heading));
  for (const heading of ['문제', '해결', '주요 기능', '프로젝트 화면', '개발 과정', '시스템 구조', '회고', '결과', '기술 스택', '팀']) {
    assert.match(hackathon, new RegExp(heading));
  }
  assert.match(gallery, /slice\(0, MAX_GALLERY_IMAGES\)/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- --test-name-pattern="all detail pages keep"`

Expected: `DetailSection.tsx`가 없어 FAIL

- [ ] **Step 3: 공통 상세 구역과 갤러리 제한 구현**

`DetailSection.tsx`:

```tsx
export default function DetailSection({ eyebrow, title, empty = false, children }: {
  eyebrow: string;
  title: string;
  empty?: boolean;
  children?: React.ReactNode;
}) {
  return <section className="detail-section">
    <p className="mono cyan">{eyebrow}</p>
    <h2>{title}</h2>
    <div className="detail-section-body">
      {empty ? <p className="detail-empty">준비 중입니다.</p> : children}
    </div>
  </section>;
}
```

`MediaGallery`는 `urls.slice(0, MAX_GALLERY_IMAGES)`만 렌더링한다.

- [ ] **Step 4: 활동과 세미나 상세 적용**

활동은 대표 이미지 placeholder 뒤에 `활동 내용`, `활동 사진`을 항상 렌더링한다. 세미나는 `세미나 내용`, `세미나 사진`, `관련 자료`를 항상 렌더링한다. 각 구역의 `empty`는 문자열 `trim()`, 배열 길이 또는 URL 존재 여부로 결정한다.

- [ ] **Step 5: 해커톤 상세 적용**

기존 조건부 구역을 제거하고 10개 `DetailSection`을 항상 렌더링한다. 배열은 비어 있으면 `empty`, 텍스트는 `trim()` 결과가 없으면 `empty`로 처리한다. 문제와 해결, 기술 스택과 팀의 2열 구조는 유지한다. 링크 nav는 URL이 없으면 `준비 중입니다.`를 표시한다.

- [ ] **Step 6: Task 3 검증**

Run: `npm test -- --test-name-pattern="activity and archive records|all detail pages keep"`

Expected: 관련 테스트 PASS

- [ ] **Step 7: Task 3 커밋**

```bash
git add src/components/DetailSection.tsx src/components/MediaGallery.tsx src/pages/ActivityDetailPage.tsx src/pages/SeminarDetailPage.tsx src/pages/HackathonDetailPage.tsx test/homepage.test.mjs
git commit -m "feat: structure detail content sections"
```

---

### Task 4: 상세 타이포그래피와 관리자 업로드 UI

**Files:**
- Modify: `src/index.css`
- Test: `test/homepage.test.mjs`

**Interfaces:**
- Consumes: `.detail-section`, `.detail-section-body`, `.detail-empty`, `.gallery-upload-grid`, `.single-upload-preview`, `.editor-group`
- Produces: 세 상세 페이지와 두 편집 폼의 공통 시각 위계

- [ ] **Step 1: 상세 CSS 계약 테스트 작성**

```js
test('detail typography and sections use a restrained editorial scale', async () => {
  const styles = await read('src/index.css');
  assert.match(styles, /\.detail-hero h1,.hack-detail-hero h1\{[^}]*clamp\(40px,6vw,72px\)/);
  assert.match(styles, /\.detail-section\{[^}]*border-top:/);
  assert.match(styles, /\.detail-section h2\{[^}]*clamp\(26px,3\.5vw,40px\)/);
  assert.match(styles, /\.detail-section-body\{[^}]*line-height:1\.8/);
  assert.match(styles, /\.gallery-upload-grid\{/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- --test-name-pattern="detail typography"`

Expected: 기존 110px 제목 규칙 때문에 FAIL

- [ ] **Step 3: 상세 페이지 CSS 구현**

- hero title을 `clamp(40px,6vw,72px)`로 조정한다.
- `.detail-content`의 큰 일괄 gap 대신 대표 이미지와 구역별 간격을 사용한다.
- `.detail-section`에 `padding:56px 0`과 반투명 상단 경계를 적용한다.
- `.detail-section h2`는 `clamp(26px,3.5vw,40px)`를 사용한다.
- `.detail-section-body`는 본문 최대 폭, `clamp(16px,1.4vw,19px)`, `line-height:1.8`을 사용한다.
- `.detail-empty`는 낮은 대비의 점선 패널로 표시한다.
- 모바일에서는 hero 최대 48px, 구역 제목 최대 30px, 사진 1열을 적용한다.

- [ ] **Step 4: 관리자 업로드 CSS 구현**

- fieldset과 legend로 폼 구역을 시각적으로 나눈다.
- 단일 이미지 미리보기와 다중 이미지 미리보기를 작은 카드로 표시한다.
- 갤러리 미리보기는 최대 5개의 번호와 삭제 버튼을 갖는다.
- 파일 입력과 안내 문구는 기존 관리자 색상과 focus 스타일을 유지한다.

- [ ] **Step 5: 전체 자동 검증**

Run: `npm test`

Expected: 모든 테스트 PASS

Run: `npm run typecheck`

Expected: exit code 0

Run: `npm run build`

Expected: root base build 성공

Run: `npm run build -- --base=/OPT-Homepage/`

Expected: GitHub Pages base build 성공

- [ ] **Step 6: 브라우저 검증**

- 관리자 편집창에서 5장 선택, 6번째 차단, 미리보기와 개별 삭제를 확인한다.
- 활동·세미나·해커톤 상세에서 모든 소제목과 빈 상태를 확인한다.
- 1280px와 모바일 viewport에서 제목 크기, 본문 폭, 사진 열 수를 확인한다.
- 공개 콘텐츠 데이터는 검증 과정에서 변경하지 않는다.

- [ ] **Step 7: Task 4 커밋 및 배포**

```bash
git add src/index.css test/homepage.test.mjs docs/superpowers/plans/2026-07-27-detail-content-and-gallery.md
git commit -m "style: improve detail page readability"
git push origin main
gh run watch --exit-status
```
