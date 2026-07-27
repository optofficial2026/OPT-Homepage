# OPT 동적 홈페이지 3회 검증 보고서

검증일: 2026-07-27

## 전제

- 로컬 구현과 기본 콘텐츠 fallback을 검증했다.
- 실제 Supabase 프로젝트는 아직 연결하지 않았다.
- Supabase 프로젝트와 최초 관리자 계정은 OPT 공식 계정으로 생성해야 한다.
- 따라서 실제 로그인 성공, 원격 CRUD, RLS 거부/허용은 외부 설정 후 확인할 항목이며 통과로 표시하지 않는다.

## 1차 — 기능과 화면

### 수행

- `npm test`: 22개 테스트 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과
- Chrome/Playwright 로컬 렌더링 확인

### 확인 결과

- 홈 제목, 2기 모집 배지, `1+ / 4+ / 11+` 통계가 표시된다.
- 활동 연혁 5개가 표시되고 최신 항목이 위에 온다.
- 푸터의 관리자 로그인 진입점은 하나만 표시된다.
- `/log/?id=activity-1`에서 활동 상세 본문이 표시된다.
- `/archive/?id=hackathon-1`에서 채택 HTML의 최종 상세 구조가 표시된다.
  - 문제
  - 해결
  - 주요 기능
  - 프로젝트 화면
  - 개발 과정
  - 시스템 구조
  - 회고
  - 결과
  - 기술 스택
  - 팀
- 공개 상태의 해커톤 상세에는 관리자 편집 버튼이 표시되지 않는다.
- 모집 모드를 끈 캐시 상태에서 ticker, hero 모집 배지, 내비게이션 지원 CTA가 모두 사라지고 하단 종료 문구만 남는다.
- Supabase 미연결 상태에서 관리자 로그인 시 설정 필요 안내가 표시되고 공개 사이트는 계속 동작한다.

### 1차에서 달라진 점

목록만 있던 활동/아카이브를 실제 상세 URL과 상세 본문으로 연결했다. 채택된 마지막 해커톤 상세 글 디자인을 React 화면과 편집 필드에 모두 반영했다.

## 2차 — 보안과 장애

### 수행

- Postgres/Storage RLS 정책 정적 검토
- 공개 키와 비밀 키 사용 경계 검색
- 캐시 손상, Storage 차단, 파일 형식/크기 테스트
- Supabase 최초 연결 상태 검토

### 확인 결과

- 공개 사용자는 조회만 가능하고, 쓰기는 `admin_profiles`에 Auth UUID가 등록된 사용자만 가능하도록 SQL 정책이 정의되어 있다.
- 클라이언트는 이메일, metadata, localStorage 값으로 관리자 권한을 결정하지 않는다.
- 서비스 역할 키는 프론트엔드 구성에 없다.
- 잘못된 캐시 JSON과 이전 버전 캐시는 무시된다.
- localStorage 접근/용량 오류가 공개 화면을 중단하지 않는다.
- JPEG/PNG/WebP, 최대 5MB 제한이 클라이언트와 Storage bucket 양쪽에 있다.
- Supabase가 없거나 조회가 실패하면 캐시 또는 번들 기본 콘텐츠로 내려간다.

### 발견 및 수정

최초 마이그레이션에 설정 행만 있고 기존 연혁·활동·아카이브 행이 없어서, Supabase 연결 직후 공개 목록이 비어 보일 수 있었다. 현재 기본 콘텐츠를 마이그레이션 seed에 추가했다.

기존 연혁의 `2026년 상반기`, `2026년 여름방학` 같은 표시 문자열은 단순 문자열 정렬 시 순서가 어긋날 수 있었다. 현재 사용 중인 기간 표기를 정렬 키로 정규화하는 테스트와 로직을 추가했다.

### 외부 설정 후 필수 실검증

- 익명 사용자의 직접 insert/update/delete가 RLS로 거부되는지
- 일반 Auth 사용자가 거부되는지
- `admin_profiles` 등록 관리자만 CRUD와 이미지 업로드가 가능한지
- 세션 만료와 재로그인 동작

## 3차 — 배포와 운영

### 수행

- 루트 base `/` 빌드 통과
- GitHub project Pages base `/OPT-Homepage/` 빌드 통과
- preview 서버 직접 접근 확인
- GitHub Actions workflow와 README 절차 검토

### 확인 결과

- `/OPT-Homepage/`: HTTP 200
- `/OPT-Homepage/log/?id=transformer-review`: HTTP 200
- `/OPT-Homepage/archive/?id=paper-pilot`: HTTP 200
- 세 HTML 진입점 모두 `/OPT-Homepage/assets/...` 자산 경로를 사용한다.
- Actions는 `npm ci → test → typecheck → build → Pages deploy` 순서다.
- 저장소 Pages에서는 `/OPT-Homepage/`, `opt.it.kr` 적용 후에는 `/`로 환경값만 변경하면 된다.
- Supabase 생성, SQL 실행, OPT 공식 관리자 등록, GitHub 변수, Pages 활성화, 추후 도메인 변경 절차가 README에 있다.

### 실제 배포 확인

- 공개 URL: `https://optofficial2026.github.io/OPT-Homepage/`
- GitHub Actions run: `30247411345`
- checkout, 의존성 설치, 테스트, 타입 검사, 빌드, artifact 업로드, Pages 배포 전 단계 성공
- 공개 홈, 활동 상세, 해커톤 상세 및 자산 요청 HTTP 200
- Chrome 렌더링에서 홈 `1+ / 4+ / 11+`, PaperPilot 상세 10개 섹션, 공개 상태 관리자 버튼 미노출, 브라우저 오류 없음

### 3차에서 달라진 점

절대 `/log/`, `/archive/` 링크를 `BASE_URL` 기반 helper로 통일했다. 애플리케이션 코드를 다시 바꾸지 않고 저장소 Pages와 사용자 지정 도메인을 오갈 수 있게 됐다.

## 회차 비교

| 회차 | 초점 | 새로 발견한 내용 | 수정한 내용 | 남은 외부 의존성 |
|---|---|---|---|---|
| 1 | 공개 기능과 상세 화면 | 목록 카드에 실제 상세 흐름이 필요 | 활동·세미나·해커톤 상세와 인라인 편집 연결 | 없음 |
| 2 | 권한과 장애 | 최초 Supabase 연결 시 목록 공백 가능, 한글 기간 정렬 문제 | DB seed, 기간 정렬, 공식 계정 소유 원칙 반영 | OPT 공식 Supabase 프로젝트에서 RLS 실검증 |
| 3 | 배포와 운영 | 저장소 Pages는 루트 절대 링크가 깨짐 | base helper와 Actions/README 추가, GitHub Pages 실제 배포 | Supabase Actions 변수, 추후 DNS |

## 결론

구조적으로 공개 조회와 관리자 쓰기가 분리되어 있고, 현재 페이지에서 로그인 후 편집하는 방식으로 설정·연혁·활동·세미나·해커톤을 관리할 수 있다. 별도 관리자 페이지가 없어도 운영 범위에는 충분하다.

완전한 운영 확인의 마지막 조건은 OPT 공식 계정으로 Supabase 프로젝트를 만들고 마이그레이션을 적용한 뒤 RLS 실검증을 수행하는 것이다. 이 확인 전에는 “실제 원격 관리까지 검증 완료”로 간주하지 않는다.
