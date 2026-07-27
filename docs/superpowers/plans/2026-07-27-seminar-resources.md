# Seminar Resources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 세미나 상세에 종류·제목·설명·행동이 명확한 자료 카드를 최대 5개 제공한다.

**Architecture:** `SeminarDetail`의 기존 JSON에 선택적 `resources` 배열을 추가한다. 순수 helper가 최대 개수·기존 링크 fallback·버튼 문구를 결정하고, 공용 편집 컴포넌트가 파일 업로드 또는 외부 링크를 배열로 저장한다.

**Tech Stack:** React, TypeScript, Supabase Storage, Node test runner, Vite

## Global Constraints

- DB migration과 새 의존성은 추가하지 않는다.
- 기존 `resourceUrl`은 자동 호환한다.
- 자료는 최대 5개, 파일은 PDF·PPT·PPTX 및 20MB 이하만 허용한다.

### Task 1: 자료 모델과 제한

**Files:** `src/data/types.ts`, `src/lib/seminar-resources.ts`, `src/lib/resource-storage.ts`, `test/seminar-resources.test.mjs`

- [ ] 실패 테스트: 5개 제한, 파일 검증, 기존 URL fallback, 종류별 버튼 문구
- [ ] 최소 helper와 타입 구현
- [ ] 관련 테스트와 typecheck 통과

### Task 2: 관리자 자료 편집

**Files:** `src/components/SeminarResourcesField.tsx`, `src/components/ArchiveEditor.tsx`

- [ ] 숨은 JSON 폼 값과 최대 5개 카드 추가·삭제 UI 구현
- [ ] PDF·PPT·PPTX 직접 업로드와 VIDEO·WEB·CODE URL 입력 구현
- [ ] 기존 `resourceUrl` 보존 및 `resources` 저장

### Task 3: 공개 카드와 배포

**Files:** `src/pages/SeminarDetailPage.tsx`, `src/index.css`, `test/homepage.test.mjs`

- [ ] 관련 자료 구역을 자료 카드 목록으로 교체
- [ ] 종류 badge, 제목, 설명, 구체적 링크 문구와 접근 가능한 이름 적용
- [ ] 전체 테스트, typecheck, Pages build, 커밋·push·Actions 성공 확인
