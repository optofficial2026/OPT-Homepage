import { useState, type FormEvent } from 'react';
import type { ArchiveItem, HackathonDetail, SeminarDetail } from '../data/types';
import { saveArchiveItem } from '../lib/content-mutations';
import { validateSlug } from '../data/content';
import { useEditorSafety } from '../hooks/useEditorSafety';
import { useSite } from './SiteContext';
import GalleryUploadField from './GalleryUploadField';
import ImageUploadField from './ImageUploadField';
import SeminarResourcesField from './SeminarResourcesField';
import { visibleSeminarResources } from '../lib/seminar-resources';

const list = (data: FormData, name: string) =>
  String(data.get(name) ?? '').split('\n').map((item) => item.trim()).filter(Boolean);
const resources = (data: FormData) => {
  try {
    const value = JSON.parse(String(data.get('resources') ?? '[]'));
    return Array.isArray(value) ? value : [];
  } catch { return []; }
};

export default function ArchiveEditor({ value, kind, close }: { value?: ArchiveItem; kind: ArchiveItem['kind']; close: () => void }) {
  const { refetch } = useSite();
  const [error, setError] = useState('');
  const [slug] = useState(() => value?.slug ?? `${kind}-${crypto.randomUUID()}`);
  const {
    isSaving,
    setIsSaving,
    setIsDirty,
    pendingUploads,
    onUploadPendingChange,
    requestClose,
  } = useEditorSafety(close);
  const seminar = value?.kind === 'seminar' ? value.detail as SeminarDetail : null;
  const hackathon = value?.kind === 'hackathon' ? value.detail as HackathonDetail : null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving || pendingUploads > 0) return;
    const form = new FormData(event.currentTarget);
    const nextSlug = String(form.get('slug'));
    if (!validateSlug(nextSlug)) {
      setError('주소 이름은 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.');
      return;
    }
    const detail: SeminarDetail | HackathonDetail = kind === 'seminar' ? {
      format: String(form.get('format')) as SeminarDetail['format'],
      body: String(form.get('body')),
      heroImageUrl: String(form.get('heroImageUrl')),
      galleryUrls: list(form, 'galleryUrls'),
      resourceUrl: seminar?.resourceUrl ?? '',
      resources: resources(form),
    } : {
      tagline: String(form.get('tagline')),
      award: String(form.get('award')),
      heroImageUrl: String(form.get('heroImageUrl')),
      problem: String(form.get('problem')),
      solution: String(form.get('solution')),
      features: list(form, 'features'),
      galleryUrls: list(form, 'galleryUrls'),
      process: list(form, 'process'),
      architecture: String(form.get('architecture')),
      retrospective: String(form.get('retrospective')),
      result: String(form.get('result')),
      techStack: list(form, 'techStack'),
      teamName: String(form.get('teamName')),
      teamMembers: list(form, 'teamMembers'),
      githubUrl: String(form.get('githubUrl')),
      demoUrl: String(form.get('demoUrl')),
      presentationUrl: String(form.get('presentationUrl')),
    };
    setError('');
    setIsSaving(true);
    try {
      await saveArchiveItem({
        id: value?.id ?? `new-${Date.now()}`,
        slug: nextSlug,
        kind,
        cohort: Number(form.get('cohort')),
        occurredOn: String(form.get('occurredOn')),
        title: String(form.get('title')),
        summary: String(form.get('summary')),
        thumbnailUrl: String(form.get('thumbnailUrl')),
        detail,
      });
      await refetch();
      setIsDirty(false);
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return <dialog className="admin-dialog editor-dialog wide-dialog" open><form onSubmit={submit} onChange={() => setIsDirty(true)}>
    <button className="dialog-close" type="button" onClick={requestClose}>×</button>
    <p className="mono cyan">ARCHIVE EDIT</p>
    <h2>{kind === 'hackathon' ? '해커톤' : '세미나'} {value ? '수정' : '추가'}</h2>

    <fieldset className="editor-group">
      <legend>기본 정보</legend>
      <label>제목<input name="title" defaultValue={value?.title} required /></label>
      {value
        ? <details className="editor-advanced"><summary>고급 설정</summary><label>주소 이름 (영문)
          <small>기존 링크가 바뀔 수 있으므로 필요한 경우에만 수정하세요.</small>
          <input name="slug" defaultValue={slug} required />
        </label></details>
        : <input name="slug" type="hidden" value={slug} />}
      <label>기수<input name="cohort" type="number" min="0" defaultValue={value?.cohort ?? 1} required /></label>
      <label>날짜<input name="occurredOn" type="date" defaultValue={value?.occurredOn.slice(0, 10)} required /></label>
      <label>목록 요약
        <small>아카이브 목록과 상세 페이지 제목 아래에 표시됩니다.</small>
        <textarea name="summary" defaultValue={value?.summary} required />
      </label>
    </fieldset>

    <fieldset className="editor-group">
      <legend>목록 이미지</legend>
      <ImageUploadField
        label="목록 썸네일"
        name="thumbnailUrl"
        folder="archive"
        value={value?.thumbnailUrl}
        description="아카이브 목록 카드에 보이는 작은 사진입니다."
        onUploadPendingChange={onUploadPendingChange}
      />
    </fieldset>

    {kind === 'seminar' ? <>
      <fieldset className="editor-group">
        <legend>상세 페이지</legend>
        <label>자료 형식
          <small>발표 슬라이드는 SLIDE, 글이나 필기 자료는 NOTE를 선택하세요.</small>
          <select name="format" defaultValue={seminar?.format ?? 'SLIDE'}><option value="SLIDE">SLIDE</option><option value="NOTE">NOTE</option></select>
        </label>
        <label>세미나 내용
          <small>문단 사이에 빈 줄을 넣어 작성하세요. 비워두면 ‘준비 중입니다.’가 표시됩니다.</small>
          <textarea name="body" rows={8} defaultValue={seminar?.body} />
        </label>
        <ImageUploadField
          label="상세 대표 이미지"
          name="heroImageUrl"
          folder="archive"
          value={seminar?.heroImageUrl}
          description="상세 페이지 제목 아래에 크게 보이는 사진 한 장입니다."
          onUploadPendingChange={onUploadPendingChange}
        />
        <GalleryUploadField
          name="galleryUrls"
          folder="archive"
          value={seminar?.galleryUrls}
          description="상세 페이지의 ‘세미나 사진’에 표시됩니다. 최대 5장입니다."
          onUploadPendingChange={onUploadPendingChange}
        />
      </fieldset>
      <fieldset className="editor-group">
        <legend>관련 링크</legend>
        <SeminarResourcesField
          name="resources"
          value={seminar ? visibleSeminarResources(seminar) : []}
          onUploadPendingChange={onUploadPendingChange}
        />
      </fieldset>
    </> : <>
      <fieldset className="editor-group">
        <legend>상세 페이지</legend>
        <label>한 줄 소개<input name="tagline" defaultValue={hackathon?.tagline} /></label>
        <label>수상 내역<input name="award" defaultValue={hackathon?.award} /></label>
        <ImageUploadField
          label="상세 대표 이미지"
          name="heroImageUrl"
          folder="archive"
          value={hackathon?.heroImageUrl}
          description="해커톤 상세 페이지 제목 아래에 크게 보이는 대표 화면입니다."
          onUploadPendingChange={onUploadPendingChange}
        />
        <label>문제<textarea name="problem" defaultValue={hackathon?.problem} /></label>
        <label>해결<textarea name="solution" defaultValue={hackathon?.solution} /></label>
        <label>주요 기능 (한 줄에 하나)<textarea name="features" defaultValue={hackathon?.features.join('\n')} /></label>
        <GalleryUploadField
          name="galleryUrls"
          folder="archive"
          value={hackathon?.galleryUrls}
          description="상세 페이지의 ‘프로젝트 화면’에 표시됩니다. 최대 5장입니다."
          onUploadPendingChange={onUploadPendingChange}
        />
        <label>개발 과정 (한 줄에 하나)<textarea name="process" defaultValue={hackathon?.process.join('\n')} /></label>
        <label>시스템 구조<textarea name="architecture" defaultValue={hackathon?.architecture} /></label>
        <label>회고<textarea name="retrospective" defaultValue={hackathon?.retrospective} /></label>
        <label>결과<textarea name="result" defaultValue={hackathon?.result} /></label>
        <label>기술 스택 (한 줄에 하나)<textarea name="techStack" defaultValue={hackathon?.techStack.join('\n')} /></label>
        <label>팀 이름<input name="teamName" defaultValue={hackathon?.teamName} /></label>
        <label>팀원과 역할 (한 줄에 하나)<textarea name="teamMembers" defaultValue={hackathon?.teamMembers.join('\n')} /></label>
      </fieldset>
      <fieldset className="editor-group">
        <legend>관련 링크</legend>
        <label>GitHub 링크
          <small>프로젝트 소스 코드를 여는 ‘GitHub’ 버튼 주소입니다.</small>
          <input name="githubUrl" type="url" defaultValue={hackathon?.githubUrl} />
        </label>
        <label>데모 링크
          <small>실행 중인 결과물을 여는 ‘라이브 데모’ 버튼 주소입니다.</small>
          <input name="demoUrl" type="url" defaultValue={hackathon?.demoUrl} />
        </label>
        <label>발표 자료 링크
          <small>슬라이드나 발표 문서를 여는 ‘발표 자료’ 버튼 주소입니다.</small>
          <input name="presentationUrl" type="url" defaultValue={hackathon?.presentationUrl} />
        </label>
      </fieldset>
    </>}

    <footer className="editor-actions">
      <button className="button outline" type="button" onClick={requestClose}>취소</button>
      <div>{error && <p className="form-error">{error}</p>}{pendingUploads > 0 && <small>파일 업로드가 끝나면 저장할 수 있습니다.</small>}</div>
      <button className="button primary" type="submit" disabled={isSaving || pendingUploads > 0}>
        {pendingUploads > 0 ? '업로드 중…' : isSaving ? '저장 중…' : '저장'}
      </button>
    </footer>
  </form></dialog>;
}
