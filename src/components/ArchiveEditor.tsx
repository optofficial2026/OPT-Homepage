import { useState, type FormEvent } from 'react';
import type { ArchiveItem, HackathonDetail, SeminarDetail } from '../data/types';
import { saveArchiveItem } from '../lib/content-mutations';
import { validateSlug } from '../data/content';
import { useSite } from './SiteContext';
import GalleryUploadField from './GalleryUploadField';
import ImageUploadField from './ImageUploadField';

const list = (data: FormData, name: string) =>
  String(data.get(name) ?? '').split('\n').map((item) => item.trim()).filter(Boolean);

export default function ArchiveEditor({ value, kind, close }: { value?: ArchiveItem; kind: ArchiveItem['kind']; close: () => void }) {
  const { refetch } = useSite();
  const [error, setError] = useState('');
  const seminar = value?.kind === 'seminar' ? value.detail as SeminarDetail : null;
  const hackathon = value?.kind === 'hackathon' ? value.detail as HackathonDetail : null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const slug = String(form.get('slug'));
    if (!validateSlug(slug)) {
      setError('주소 이름은 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.');
      return;
    }
    const detail: SeminarDetail | HackathonDetail = kind === 'seminar' ? {
      format: String(form.get('format')) as SeminarDetail['format'],
      body: String(form.get('body')),
      heroImageUrl: String(form.get('heroImageUrl')),
      galleryUrls: list(form, 'galleryUrls'),
      resourceUrl: String(form.get('resourceUrl')),
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
    try {
      await saveArchiveItem({
        id: value?.id ?? `new-${Date.now()}`,
        slug,
        kind,
        cohort: Number(form.get('cohort')),
        occurredOn: String(form.get('occurredOn')),
        title: String(form.get('title')),
        summary: String(form.get('summary')),
        thumbnailUrl: String(form.get('thumbnailUrl')),
        detail,
      });
      await refetch();
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '저장하지 못했습니다.');
    }
  };

  return <dialog className="admin-dialog editor-dialog wide-dialog" open><form onSubmit={submit}>
    <button className="dialog-close" type="button" onClick={close}>×</button>
    <p className="mono cyan">ARCHIVE EDIT</p>
    <h2>{kind === 'hackathon' ? '해커톤' : '세미나'} {value ? '수정' : '추가'}</h2>

    <fieldset className="editor-group">
      <legend>기본 정보</legend>
      <label>제목<input name="title" defaultValue={value?.title} required /></label>
      <label>주소 이름 (영문)
        <small>상세 페이지 주소에 사용됩니다. 예: transformer-seminar</small>
        <input name="slug" defaultValue={value?.slug} placeholder="transformer-seminar" required />
      </label>
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
          <small>비워두면 상세 페이지에 ‘준비 중입니다.’가 표시됩니다.</small>
          <textarea name="body" rows={8} defaultValue={seminar?.body} />
        </label>
        <ImageUploadField
          label="상세 대표 이미지"
          name="heroImageUrl"
          folder="archive"
          value={seminar?.heroImageUrl}
          description="상세 페이지 제목 아래에 크게 보이는 사진 한 장입니다."
        />
        <GalleryUploadField
          name="galleryUrls"
          folder="archive"
          value={seminar?.galleryUrls}
          description="상세 페이지의 ‘세미나 사진’에 표시됩니다. 최대 5장입니다."
        />
      </fieldset>
      <fieldset className="editor-group">
        <legend>관련 링크</legend>
        <label>관련 자료 링크
          <small>PDF, Google Drive, Notion 등 ‘자료 보기’ 버튼으로 열 주소입니다.</small>
          <input name="resourceUrl" type="url" defaultValue={seminar?.resourceUrl} />
        </label>
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
        />
        <label>문제<textarea name="problem" defaultValue={hackathon?.problem} /></label>
        <label>해결<textarea name="solution" defaultValue={hackathon?.solution} /></label>
        <label>주요 기능 (한 줄에 하나)<textarea name="features" defaultValue={hackathon?.features.join('\n')} /></label>
        <GalleryUploadField
          name="galleryUrls"
          folder="archive"
          value={hackathon?.galleryUrls}
          description="상세 페이지의 ‘프로젝트 화면’에 표시됩니다. 최대 5장입니다."
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

    {error && <p className="form-error">{error}</p>}
    <button className="button primary" type="submit">저장</button>
  </form></dialog>;
}
