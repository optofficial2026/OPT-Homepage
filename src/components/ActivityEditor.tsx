import { useState, type FormEvent } from 'react';
import type { ActivityPost } from '../data/types';
import { saveActivityPost } from '../lib/content-mutations';
import { validateSlug } from '../data/content';
import { useSite } from './SiteContext';
import ImageUploadField from './ImageUploadField';

const lines = (value: FormDataEntryValue | null) => String(value ?? '').split('\n').map((item) => item.trim()).filter(Boolean);

export default function ActivityEditor({ value, close }: { value?: ActivityPost; close: () => void }) {
  const { refetch } = useSite();
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const slug = String(form.get('slug'));
    if (!validateSlug(slug)) { setError('슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.'); return; }
    try {
      await saveActivityPost({
        id: value?.id ?? `new-${Date.now()}`, slug,
        tag: String(form.get('tag')) as ActivityPost['tag'],
        cohort: Number(form.get('cohort')), occurredOn: String(form.get('occurredOn')),
        title: String(form.get('title')), summary: String(form.get('summary')), body: String(form.get('body')),
        thumbnailUrl: String(form.get('thumbnailUrl')), heroImageUrl: String(form.get('heroImageUrl')),
        galleryUrls: lines(form.get('galleryUrls')),
      });
      await refetch(); close();
    } catch (reason) { setError(reason instanceof Error ? reason.message : '저장하지 못했습니다.'); }
  };
  return <dialog className="admin-dialog editor-dialog" open><form onSubmit={submit}>
    <button className="dialog-close" type="button" onClick={close}>×</button><p className="mono cyan">ACTIVITY EDIT</p><h2>활동 기록 {value ? '수정' : '추가'}</h2>
    <label>제목<input name="title" defaultValue={value?.title} required /></label>
    <label>슬러그<input name="slug" defaultValue={value?.slug} placeholder="paper-reading-1" required /></label>
    <label>종류<select name="tag" defaultValue={value?.tag ?? 'STUDY'}><option>STUDY</option><option>SEMINAR</option><option>EVENT</option></select></label>
    <label>기수<input name="cohort" type="number" min="0" defaultValue={value?.cohort ?? 1} required /></label>
    <label>날짜<input name="occurredOn" type="date" defaultValue={value?.occurredOn.slice(0, 10)} required /></label>
    <label>요약<textarea name="summary" defaultValue={value?.summary} required /></label>
    <label>본문<textarea name="body" rows={8} defaultValue={value?.body} required /></label>
    <ImageUploadField label="썸네일 URL 또는 파일" name="thumbnailUrl" folder="activity" value={value?.thumbnailUrl} />
    <ImageUploadField label="대표 이미지 URL 또는 파일" name="heroImageUrl" folder="activity" value={value?.heroImageUrl} />
    <label>갤러리 URL (한 줄에 하나)<textarea name="galleryUrls" defaultValue={value?.galleryUrls.join('\n')} /></label>
    {error && <p className="form-error">{error}</p>}<button className="button primary" type="submit">저장</button>
  </form></dialog>;
}
