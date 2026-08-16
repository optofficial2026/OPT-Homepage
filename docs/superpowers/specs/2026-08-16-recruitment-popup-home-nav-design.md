# 모집 팝업 및 홈·소개 네비게이션 개편 설계

## 목표

홈 하단의 큰 모집 배너를 제거하고, 모집 안내를 홈 진입 시 세션당 한 번 표시되는 팝업으로 전환한다. 관리자는 `홈 정보 수정`에서 팝업 노출 여부를 제어할 수 있어야 하며, 네비게이션은 `홈 / 소개 / 활동기록 / 아카이브` 구조로 바꾼다.

## 확정된 동작

- 기존 `recruitmentEnabled`는 모집 상태와 모집 내용의 활성 여부로 유지한다.
- `recruitmentPopupEnabled`를 별도 `SiteSettings` 필드로 추가한다.
- 두 설정이 모두 켜진 경우에만 홈에서 팝업을 자동 표시한다.
- 팝업 표시 여부는 `sessionStorage`의 고정 키로 관리한다. 팝업을 처음 표시하는 순간 현재 브라우저 세션의 표시 완료를 기록하고, 닫기·ESC·배경 클릭으로 팝업을 닫을 수 있다.
- 모집 폼 링크가 있으면 팝업의 지원 버튼이 외부 링크를 열고, 없으면 기존처럼 비활성 버튼을 보여준다.
- 기존 하단 `.recruit-banner`는 홈에서 제거한다. 상단 모집 ticker와 hero 모집 badge는 기존 동작을 유지한다.
- 기존 `/` 홈 콘텐츠는 네비게이션에서 `홈`으로 표시한다.
- `/intro/` 정적 진입점을 추가하고 공통 네비게이션·footer를 유지한 빈 본문 `소개` 페이지를 제공한다. 향후 소개 콘텐츠를 이 페이지에 추가한다.

## 데이터 흐름

1. `site_settings.recruitment_popup_enabled`를 기본값 `true`로 추가한다.
2. 저장소 변환 함수는 컬럼이 아직 없는 구버전 응답에서도 `true`로 fallback한다.
3. `SettingsEditor`는 모집 모드와 별개로 `모집 팝업 표시` 체크박스를 저장한다.
4. `HomePage`는 설정과 세션 상태를 읽어 `RecruitmentPopup`을 표시한다.

## 파일 경계

- `src/data/types.ts`, `src/data/content.ts`: 설정 타입과 기본값
- `src/lib/content-repository.ts`, `src/lib/content-mutations.ts`: DB 읽기·쓰기 매핑
- `src/components/HomeEditors.tsx`: 관리자 팝업 노출 토글
- `src/components/RecruitmentPopup.tsx`: 세션당 1회 팝업 상태와 표시 UI
- `src/components/SiteContext.tsx`: 원격 설정 로딩 완료 상태 전달
- `src/pages/HomePage.tsx`: 하단 배너 제거와 팝업 연결
- `src/pages/IntroPage.tsx`, `intro/index.html`: 빈 소개 화면
- `src/App.tsx`, `src/components/Navigation.tsx`: 페이지 타입과 네비게이션 라벨·링크
- `src/index.css`: 빈 소개 화면의 최소 레이아웃 스타일
- `styles.css`: 기존 공통 모달 스타일 재사용
- `test/homepage.test.mjs`: 라우팅·설정·팝업 회귀 단언
- `supabase/migrations/20260816000000_add_recruitment_popup_setting.sql`: 운영 설정 컬럼

## 오류 및 호환성

- Supabase 응답에 새 컬럼이 없거나 값이 null이면 기본값 `true`를 사용해 기존 배포가 깨지지 않도록 한다.
- 세션 저장소를 사용할 수 없는 환경에서는 팝업을 표시하되, 닫은 뒤 상태 저장 실패가 렌더링을 막지 않도록 한다.
- 관리자 저장은 기존 `updateSiteSettings`의 행 영향 검증을 그대로 사용한다.
- 소개 페이지는 데이터 조회를 새로 만들지 않고 기존 `SiteProvider`와 공통 레이아웃만 사용한다.

## 검증 기준

- 홈 하단 모집 배너 문자열과 DOM이 제거된다.
- 모집 팝업 설정이 타입·기본 콘텐츠·DB 조회·저장 폼에 연결된다.
- 홈 팝업이 세션당 1회 동작하고 닫기 수단을 제공한다.
- `/intro/`가 공통 네비게이션·footer와 함께 로드된다.
- `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`가 통과한다.
- 로컬 브라우저에서 홈 팝업과 소개 빈 화면을 확인하고, PR 병합 후 Pages 배포와 운영 URL을 확인한다.
