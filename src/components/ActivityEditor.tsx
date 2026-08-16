import { useState, type FormEvent } from 'react';
import type { ActivityPost } from '../data/types';
import { saveActivityPost } from '../lib/content-mutations';
import { validateSlug } from '../data/content';
import { useEditorSafety } from '../hooks/useEditorSafety';
import { useFormDraft } from '../hooks/useFormDraft';
import { useSite } from './SiteContext';
import GalleryUploadField from './GalleryUploadField';
import ImageUploadField from './ImageUploadField';

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? '').split('\n').map((item) => item.trim()).filter(Boolean);

export default function ActivityEditor({ value, close }: { value?: ActivityPost; close: () => void }) {
  const { refetch } = useSite();
  const [error, setError] = useState('');
  const [slug] = useState(() => value?.slug ?? `activity-${crypto.randomUUID()}`);
  const {
    isSaving,
    setIsSaving,
    setIsDirty,
    pendingUploads,
    onUploadPendingChange,
    requestClose,
  } = useEditorSafety(close, { draftKept: true });
  const { formRef, saveDraft, clearDraft } = useFormDraft(`opt-draft-activity-${value?.id ?? 'new'}`);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving || pendingUploads > 0) return;
    const form = new FormData(event.currentTarget);
    const nextSlug = String(form.get('slug'));
    if (!validateSlug(nextSlug)) {
      setError('주소 이름은 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await saveActivityPost({
        id: value?.id ?? `new-${Date.now()}`,
        slug: nextSlug,
        tag: String(form.get('tag')) as ActivityPost['tag'],
        cohort: Number(form.get('cohort')),
        occurredOn: String(form.get('occurredOn')),
        title: String(form.get('title')),
        summary: String(form.get('summary')),
        body: String(form.get('body')),
        thumbnailUrl: String(form.get('thumbnailUrl')),
        heroImageUrl: String(form.get('heroImageUrl')),
        galleryUrls: lines(form.get('galleryUrls')),
      });
      await refetch();
      setIsDirty(false);
      clearDraft();
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return <dialog className="admin-dialog editor-dialog wide-dialog" open><form ref={formRef} onSubmit={submit} onChange={(event) => { setIsDirty(true); saveDraft(event.currentTarget); }}>
    <button className="dialog-close" type="button" onClick={requestClose}>×</button>
    <p className="mono cyan">ACTIVITY EDIT</p>
    <h2>활동 기록 {value ? '수정' : '추가'}</h2>

    <fieldset className="editor-group">
      <legend>기본 정보</legend>
      <label>제목<input name="title" defaultValue={value?.title} required /></label>
      {value
        ? <details className="editor-advanced"><summary>고급 설정</summary><label>주소 이름 (영문)
          <small>기존 링크가 바뀔 수 있으므로 필요한 경우에만 수정하세요.</small>
          <input name="slug" defaultValue={slug} required />
        </label></details>
        : <input name="slug" type="hidden" value={slug} />}
      <label>종류<select name="tag" defaultValue={value?.tag ?? 'STUDY'}><option value="STUDY">스터디</option><option value="SEMINAR">세미나</option><option value="EVENT">행사</option></select></label>
      <label>기수<input name="cohort" type="number" min="0" defaultValue={value?.cohort ?? 1} required /></label>
      <label>날짜<input name="occurredOn" type="date" defaultValue={value?.occurredOn.slice(0, 10)} required /></label>
      <label>목록 요약
        <small>활동 기록 목록 카드와 상세 페이지 제목 아래에 표시됩니다.</small>
        <textarea name="summary" defaultValue={value?.summary} required />
      </label>
    </fieldset>

    <fieldset className="editor-group">
      <legend>목록 이미지</legend>
      <ImageUploadField
        label="목록 썸네일"
        name="thumbnailUrl"
        folder="activity"
        value={value?.thumbnailUrl}
        description="활동 기록 목록 카드에 표시됩니다. 16:9 비율로 가운데 기준 자동 crop됩니다."
        crop="thumbnail"
        onUploadPendingChange={onUploadPendingChange}
      />
    </fieldset>

    <fieldset className="editor-group">
      <legend>상세 페이지</legend>
      <label>활동 내용
        <small>문단 사이에 빈 줄을 넣어 작성하세요. 비워두면 ‘준비 중입니다.’가 표시됩니다.</small>
        <textarea name="body" rows={8} defaultValue={value?.body} />
      </label>
      <ImageUploadField
        label="상세 대표 이미지"
        name="heroImageUrl"
        folder="activity"
        value={value?.heroImageUrl}
        description="상세 페이지 제목 아래에 크게 보이는 사진 한 장입니다."
        onUploadPendingChange={onUploadPendingChange}
      />
      <GalleryUploadField
        name="galleryUrls"
        folder="activity"
        value={value?.galleryUrls}
        description="상세 페이지의 ‘활동 사진’에 표시됩니다. 최대 5장, 장당 10MB 이하입니다."
        onUploadPendingChange={onUploadPendingChange}
      />
    </fieldset>

    <footer className="editor-actions">
      <button className="button outline" type="button" onClick={requestClose}>취소</button>
      <div>{error && <p className="form-error">{error}</p>}{pendingUploads > 0 && <small>파일 업로드가 끝나면 저장할 수 있습니다.</small>}</div>
      <button className="button primary" type="submit" disabled={isSaving || pendingUploads > 0}>
        {pendingUploads > 0 ? '업로드 중…' : isSaving ? '저장 중…' : '저장'}
      </button>
    </footer>
  </form></dialog>;
}
