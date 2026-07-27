import { useState, type FormEvent } from 'react';
import type { ArchiveItem, HackathonDetail, SeminarDetail } from '../data/types';
import { saveArchiveItem } from '../lib/content-mutations';
import { validateSlug } from '../data/content';
import { useSite } from './SiteContext';
import ImageUploadField from './ImageUploadField';

const list = (data: FormData, name: string) => String(data.get(name) ?? '').split('\n').map((item) => item.trim()).filter(Boolean);

export default function ArchiveEditor({ value, kind, close }: { value?: ArchiveItem; kind: ArchiveItem['kind']; close: () => void }) {
  const { refetch } = useSite();
  const [error, setError] = useState('');
  const seminar = value?.kind === 'seminar' ? value.detail as SeminarDetail : null;
  const hackathon = value?.kind === 'hackathon' ? value.detail as HackathonDetail : null;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const slug = String(form.get('slug'));
    if (!validateSlug(slug)) { setError('슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.'); return; }
    const detail: SeminarDetail | HackathonDetail = kind === 'seminar' ? {
      body: String(form.get('body')), heroImageUrl: String(form.get('heroImageUrl')),
      galleryUrls: list(form, 'galleryUrls'), resourceUrl: String(form.get('resourceUrl')),
    } : {
      tagline: String(form.get('tagline')), award: String(form.get('award')), heroImageUrl: String(form.get('heroImageUrl')),
      problem: String(form.get('problem')), solution: String(form.get('solution')), features: list(form, 'features'),
      galleryUrls: list(form, 'galleryUrls'), process: list(form, 'process'), architecture: String(form.get('architecture')),
      retrospective: String(form.get('retrospective')), result: String(form.get('result')), techStack: list(form, 'techStack'),
      teamName: String(form.get('teamName')), teamMembers: list(form, 'teamMembers'),
      githubUrl: String(form.get('githubUrl')), demoUrl: String(form.get('demoUrl')), presentationUrl: String(form.get('presentationUrl')),
    };
    try {
      await saveArchiveItem({
        id: value?.id ?? `new-${Date.now()}`, slug, kind, cohort: Number(form.get('cohort')),
        occurredOn: String(form.get('occurredOn')), title: String(form.get('title')),
        summary: String(form.get('summary')), thumbnailUrl: String(form.get('thumbnailUrl')), detail,
      });
      await refetch(); close();
    } catch (reason) { setError(reason instanceof Error ? reason.message : '저장하지 못했습니다.'); }
  };
  return <dialog className="admin-dialog editor-dialog wide-dialog" open><form onSubmit={submit}>
    <button className="dialog-close" type="button" onClick={close}>×</button><p className="mono cyan">ARCHIVE EDIT</p><h2>{kind === 'hackathon' ? '해커톤' : '세미나'} {value ? '수정' : '추가'}</h2>
    <label>제목<input name="title" defaultValue={value?.title} required /></label><label>슬러그<input name="slug" defaultValue={value?.slug} required /></label>
    <label>기수<input name="cohort" type="number" min="0" defaultValue={value?.cohort ?? 1} required /></label><label>날짜<input name="occurredOn" type="date" defaultValue={value?.occurredOn.slice(0, 10)} required /></label>
    <label>목록 요약<textarea name="summary" defaultValue={value?.summary} required /></label><ImageUploadField label="썸네일 URL 또는 파일" name="thumbnailUrl" folder="archive" value={value?.thumbnailUrl} />
    {kind === 'seminar' ? <>
      <label>본문<textarea name="body" rows={8} defaultValue={seminar?.body} required /></label><ImageUploadField label="대표 이미지 URL 또는 파일" name="heroImageUrl" folder="archive" value={seminar?.heroImageUrl} />
      <label>갤러리 URL (한 줄에 하나)<textarea name="galleryUrls" defaultValue={seminar?.galleryUrls.join('\n')} /></label><label>자료 링크<input name="resourceUrl" type="url" defaultValue={seminar?.resourceUrl} /></label>
    </> : <>
      <label>한 줄 소개<input name="tagline" defaultValue={hackathon?.tagline} /></label><label>수상 내역<input name="award" defaultValue={hackathon?.award} /></label><ImageUploadField label="대표 이미지 URL 또는 파일" name="heroImageUrl" folder="archive" value={hackathon?.heroImageUrl} />
      <label>문제<textarea name="problem" defaultValue={hackathon?.problem} /></label><label>해결<textarea name="solution" defaultValue={hackathon?.solution} /></label>
      <label>주요 기능 (한 줄에 하나)<textarea name="features" defaultValue={hackathon?.features.join('\n')} /></label><label>갤러리 URL (한 줄에 하나)<textarea name="galleryUrls" defaultValue={hackathon?.galleryUrls.join('\n')} /></label>
      <label>개발 과정 (한 줄에 하나)<textarea name="process" defaultValue={hackathon?.process.join('\n')} /></label><label>시스템 구조<textarea name="architecture" defaultValue={hackathon?.architecture} /></label>
      <label>회고<textarea name="retrospective" defaultValue={hackathon?.retrospective} /></label><label>결과<textarea name="result" defaultValue={hackathon?.result} /></label>
      <label>기술 스택 (한 줄에 하나)<textarea name="techStack" defaultValue={hackathon?.techStack.join('\n')} /></label><label>팀 이름<input name="teamName" defaultValue={hackathon?.teamName} /></label>
      <label>팀원과 역할 (한 줄에 하나)<textarea name="teamMembers" defaultValue={hackathon?.teamMembers.join('\n')} /></label><label>GitHub URL<input name="githubUrl" type="url" defaultValue={hackathon?.githubUrl} /></label>
      <label>데모 URL<input name="demoUrl" type="url" defaultValue={hackathon?.demoUrl} /></label><label>발표 자료 URL<input name="presentationUrl" type="url" defaultValue={hackathon?.presentationUrl} /></label>
    </>}
    {error && <p className="form-error">{error}</p>}<button className="button primary" type="submit">저장</button>
  </form></dialog>;
}
