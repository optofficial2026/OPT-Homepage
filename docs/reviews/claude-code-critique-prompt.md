# Claude Code 비판 검토 프롬프트

아래 내용을 OPT 홈페이지 저장소를 연 Claude Code에 그대로 전달한다.

---

이 저장소의 현재 diff와 실제 파일을 독립적으로 비판 검토해줘. 코드는 수정하지 말고 리뷰 결과만 작성해.

목표는 기존 디자인과 공개 기능을 바꾸지 않으면서 다음을 추가한 구현이 올바른지 확인하는 것이다.

1. GitHub Pages 배포와 추후 `opt.it.kr` 사용자 지정 도메인
2. Supabase Auth/Postgres/Storage/RLS
3. 별도 관리자 페이지 없이 푸터 로그인 후 현재 화면에 편집 버튼 표시
4. 모집 모드 on/off
5. 홈 통계 `N+`, 연혁 CRUD/최신순/스크롤
6. 활동 기록 작성 및 `/log/?id=<slug>` 상세
7. 세미나·해커톤 작성 및 `/archive/?id=<slug>` 상세
8. 최종 채택된 해커톤 상세 글 구조:
   - 메타데이터와 수상
   - 제목/한 줄 소개/대표 이미지
   - 문제/해결
   - 주요 기능
   - 프로젝트 화면
   - 개발 과정
   - 시스템 구조
   - 회고/결과
   - 기술 스택
   - 팀원/역할
   - GitHub/데모/발표 자료 링크
9. Supabase 장애 시 `원격 → 캐시 → 번들 기본값` fallback
10. Supabase 프로젝트와 최초 관리자는 개인 계정이 아닌 OPT 공식 계정 소유

반드시 다음 파일을 직접 읽어라.

- `docs/superpowers/specs/2026-07-27-opt-dynamic-inline-admin-design.md`
- `docs/superpowers/plans/2026-07-27-opt-dynamic-inline-admin.md`
- `supabase/migrations/20260727000000_initial_content.sql`
- `src/components/SiteContext.tsx`
- `src/lib/content-repository.ts`
- `src/lib/content-mutations.ts`
- `src/lib/media-storage.ts`
- `src/pages/HomePage.tsx`
- `src/pages/LogPage.tsx`
- `src/pages/ArchivePage.tsx`
- `src/pages/ActivityDetailPage.tsx`
- `src/pages/SeminarDetailPage.tsx`
- `src/pages/HackathonDetailPage.tsx`
- `.github/workflows/deploy-pages.yml`

검토 항목:

- 기존 디자인이나 공개 동작이 의도치 않게 바뀌었는가
- 모집 off에서 ticker, hero badge, 지원 CTA, 모집 관련 UI가 모두 숨겨지고 종료 배너만 남는가
- 일반 방문자 DOM에 편집 UI가 노출되는가
- `admin_profiles`, Postgres RLS, Storage RLS가 우회 가능하거나 서로 불일치하는가
- anon key와 service-role key의 경계가 안전한가
- 캐시 손상, Supabase 장애, 빈 테이블, 세션 만료에서 화면이나 데이터가 잘못되는가
- 글/slug/이미지 입력의 검증이 부족한가
- 이미지 업로드 후 저장 실패, 교체, 삭제에서 고아 파일 또는 데이터 손실 위험이 있는가
- GitHub Pages의 `/OPT-Homepage/` base와 사용자 지정 도메인 `/`에서 모든 홈/상세/뒤로가기 링크가 맞는가
- 직접 새로고침과 query parameter 상세 접근이 동작하는가
- 채택된 해커톤 상세 HTML의 핵심 섹션이 빠졌거나 공개/편집 상태가 뒤섞였는가
- 구현이 과도하게 복잡하거나 불필요한 의존성·추상화를 추가했는가
- README의 OPT 공식 계정 소유와 실제 설정 절차에 누락이 있는가

가능하면 다음 명령도 실행해 근거를 확인해라.

```bash
npm test
npm run typecheck
npm run build
VITE_SITE_BASE_PATH=/OPT-Homepage/ npm run build
git diff --check
```

결과 형식:

1. 심각도 순서 `Critical / High / Medium / Low`
2. 각 항목에 정확한 파일과 줄 번호
3. 재현 방법 또는 실패 조건
4. 왜 문제인지
5. 가장 작은 수정 방향
6. 마지막에 `확인된 버그`, `검증이 필요한 위험`, `개인적 선호`를 분리
7. 문제가 없으면 해당 범주에 “없음”이라고 명시

추측을 사실처럼 쓰지 말고, 소스와 실행 결과가 확인된 문제만 버그로 분류해. 리뷰가 끝나도 코드를 직접 변경하지 마.

---
