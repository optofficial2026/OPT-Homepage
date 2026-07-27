import { useState, type FormEvent } from 'react';
import type { SiteSettings, TimelineItem } from '../data/types';
import { saveTimelineItem, updateSiteSettings } from '../lib/content-mutations';
import { useSite } from './SiteContext';

export function SettingsEditor({ value, close }: { value: SiteSettings; close: () => void }) {
  const { refetch } = useSite();
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await updateSiteSettings({
        recruitmentEnabled: form.get('recruitmentEnabled') === 'on',
        recruitmentCohort: Number(form.get('recruitmentCohort')),
        recruitmentCount: Number(form.get('recruitmentCount')),
        recruitmentFormUrl: String(form.get('recruitmentFormUrl')),
        recruitmentClosedMessage: String(form.get('recruitmentClosedMessage')),
        activityCohorts: Number(form.get('activityCohorts')),
        activityMembers: Number(form.get('activityMembers')),
        activityPrograms: Number(form.get('activityPrograms')),
      });
      await refetch(); close();
    } catch (reason) { setError(reason instanceof Error ? reason.message : '저장하지 못했습니다.'); }
  };
  return <dialog className="admin-dialog editor-dialog" open><form onSubmit={submit}>
    <button className="dialog-close" type="button" onClick={close}>×</button><p className="mono cyan">INLINE EDIT</p><h2>홈 정보 수정</h2>
    <label className="check-label"><input name="recruitmentEnabled" type="checkbox" defaultChecked={value.recruitmentEnabled} /> 모집 모드 사용</label>
    <label>모집 기수<input name="recruitmentCohort" type="number" min="0" defaultValue={value.recruitmentCohort} required /></label>
    <label>모집 인원<input name="recruitmentCount" type="number" min="0" defaultValue={value.recruitmentCount} required /></label>
    <label>지원 폼 링크<input name="recruitmentFormUrl" type="url" defaultValue={value.recruitmentFormUrl} /></label>
    <label>모집 종료 문구<textarea name="recruitmentClosedMessage" defaultValue={value.recruitmentClosedMessage} required /></label>
    <label>활동 기수<input name="activityCohorts" type="number" min="0" defaultValue={value.activityCohorts} required /></label>
    <label>활동 인원<input name="activityMembers" type="number" min="0" defaultValue={value.activityMembers} required /></label>
    <label>활동 프로그램 수<input name="activityPrograms" type="number" min="0" defaultValue={value.activityPrograms} required /></label>
    {error && <p className="form-error">{error}</p>}<button className="button primary" type="submit">저장</button>
  </form></dialog>;
}

export function TimelineEditor({ value, close }: { value?: TimelineItem; close: () => void }) {
  const { refetch } = useSite();
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try {
      await saveTimelineItem({
        id: value?.id ?? `timeline-new-${Date.now()}`,
        occurredOn: String(form.get('occurredOn')),
        title: String(form.get('title')),
        description: String(form.get('description')),
      });
      await refetch(); close();
    } catch (reason) { setError(reason instanceof Error ? reason.message : '저장하지 못했습니다.'); }
  };
  return <dialog className="admin-dialog editor-dialog" open><form onSubmit={submit}>
    <button className="dialog-close" type="button" onClick={close}>×</button><p className="mono cyan">INLINE EDIT</p><h2>연혁 {value ? '수정' : '추가'}</h2>
    <label>표시 날짜<input name="occurredOn" defaultValue={value?.occurredOn} placeholder="2026.09 또는 2026-09-01" required /></label>
    <label>제목<input name="title" defaultValue={value?.title} required /></label>
    <label>설명<textarea name="description" defaultValue={value?.description} required /></label>
    {error && <p className="form-error">{error}</p>}<button className="button primary" type="submit">저장</button>
  </form></dialog>;
}
