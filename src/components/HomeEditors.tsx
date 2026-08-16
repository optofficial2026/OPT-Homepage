import { useState, type FormEvent } from 'react';
import type { SiteSettings, TimelineItem } from '../data/types';
import { useEditorSafety } from '../hooks/useEditorSafety';
import { saveTimelineItem, updateSiteSettings } from '../lib/content-mutations';
import { useSite } from './SiteContext';

export function SettingsEditor({ value, close }: { value: SiteSettings; close: () => void }) {
  const { refetch } = useSite();
  const [error, setError] = useState('');
  const { isSaving, setIsSaving, setIsDirty, requestClose } = useEditorSafety(close);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    const form = new FormData(event.currentTarget);
    setError('');
    setIsSaving(true);
    try {
      await updateSiteSettings({
        recruitmentEnabled: form.get('recruitmentEnabled') === 'on',
        recruitmentPopupEnabled: form.get('recruitmentPopupEnabled') === 'on',
        recruitmentCohort: Number(form.get('recruitmentCohort')),
        recruitmentFormUrl: String(form.get('recruitmentFormUrl')),
        recruitmentClosedMessage: String(form.get('recruitmentClosedMessage')),
        activityCohorts: Number(form.get('activityCohorts')),
        activityMembers: Number(form.get('activityMembers')),
        activityPrograms: Number(form.get('activityPrograms')),
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
  return <dialog className="admin-dialog editor-dialog" open><form onSubmit={submit} onChange={() => setIsDirty(true)}>
    <button className="dialog-close" type="button" onClick={requestClose}>×</button><p className="mono cyan">INLINE EDIT</p><h2>홈 정보 수정</h2>
    <label className="check-label"><input name="recruitmentEnabled" type="checkbox" defaultChecked={value.recruitmentEnabled} /> 모집 모드 사용</label>
    <label className="check-label"><input name="recruitmentPopupEnabled" type="checkbox" defaultChecked={value.recruitmentPopupEnabled} /> 모집 팝업 표시</label>
    <label>모집 기수<input name="recruitmentCohort" type="number" min="0" defaultValue={value.recruitmentCohort} required /></label>
    <label>지원 폼 링크<input name="recruitmentFormUrl" type="url" defaultValue={value.recruitmentFormUrl} /></label>
    <label>모집 종료 문구<textarea name="recruitmentClosedMessage" defaultValue={value.recruitmentClosedMessage} required /></label>
    <label>활동 기수<input name="activityCohorts" type="number" min="0" defaultValue={value.activityCohorts} required /></label>
    <label>활동 인원<input name="activityMembers" type="number" min="0" defaultValue={value.activityMembers} required /></label>
    <label>활동 프로그램 수<input name="activityPrograms" type="number" min="0" defaultValue={value.activityPrograms} required /></label>
    <footer className="editor-actions">
      <button className="button outline" type="button" onClick={requestClose}>취소</button>
      {error && <p className="form-error">{error}</p>}
      <button className="button primary" type="submit" disabled={isSaving}>{isSaving ? '저장 중…' : '저장'}</button>
    </footer>
  </form></dialog>;
}

export function TimelineEditor({ value, close }: { value?: TimelineItem; close: () => void }) {
  const { refetch } = useSite();
  const [error, setError] = useState('');
  const { isSaving, setIsSaving, setIsDirty, requestClose } = useEditorSafety(close);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    const form = new FormData(event.currentTarget);
    setError('');
    setIsSaving(true);
    try {
      await saveTimelineItem({
        id: value?.id ?? `timeline-new-${Date.now()}`,
        occurredOn: String(form.get('occurredOn')),
        sortedOn: String(form.get('sortedOn')),
        title: String(form.get('title')),
        description: String(form.get('description')),
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
  return <dialog className="admin-dialog editor-dialog" open><form onSubmit={submit} onChange={() => setIsDirty(true)}>
    <button className="dialog-close" type="button" onClick={requestClose}>×</button><p className="mono cyan">INLINE EDIT</p><h2>연혁 {value ? '수정' : '추가'}</h2>
    <label>정렬 기준 날짜
      <small>화면에는 보이지 않고 순서를 정하는 데만 씁니다. 기간이면 시작하는 달의 아무 날짜나 고르세요.</small>
      <input name="sortedOn" type="date" defaultValue={value?.sortedOn} required />
    </label>
    <label>표시 문구
      <small>연혁에 그대로 보입니다. ‘2026년 상반기’처럼 자유롭게 쓰세요.</small>
      <input name="occurredOn" defaultValue={value?.occurredOn} placeholder="2026년 상반기" required />
    </label>
    <label>제목<input name="title" defaultValue={value?.title} required /></label>
    <label>설명<textarea name="description" defaultValue={value?.description} required /></label>
    <footer className="editor-actions">
      <button className="button outline" type="button" onClick={requestClose}>취소</button>
      {error && <p className="form-error">{error}</p>}
      <button className="button primary" type="submit" disabled={isSaving}>{isSaving ? '저장 중…' : '저장'}</button>
    </footer>
  </form></dialog>;
}
