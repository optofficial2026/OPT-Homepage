import { useRef, useState, type ChangeEvent } from 'react';
import type { SeminarResource } from '../data/types';
import type { UploadPendingChange } from '../hooks/useEditorSafety';
import { removeMedia } from '../lib/media-storage';
import {
  externalResourceError,
  MAX_SEMINAR_RESOURCES,
  resourceLimitError,
} from '../lib/seminar-resources';
import { resourceFileError, resourceTitle, uploadResource } from '../lib/resource-storage';

type Props = {
  name: string;
  value?: SeminarResource[];
  onUploadPendingChange?: UploadPendingChange;
};

type UploadKind = Extract<SeminarResource['kind'], 'PDF' | 'SLIDE'>;
type ExternalKind = Extract<SeminarResource['kind'], 'VIDEO' | 'WEB' | 'CODE'>;

export default function SeminarResourcesField({ name, value = [], onUploadPendingChange }: Props) {
  const [resources, setResources] = useState(value.slice(0, MAX_SEMINAR_RESOURCES));
  const [uploading, setUploading] = useState<UploadKind | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkKind, setLinkKind] = useState<ExternalKind>('WEB');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [status, setStatus] = useState('');
  const uploadedUrls = useRef(new Set<string>());
  const isFull = resources.length >= MAX_SEMINAR_RESOURCES;

  const upload = async (event: ChangeEvent<HTMLInputElement>, kind: UploadKind) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    const limit = resourceLimitError(resources.length);
    if (limit) { setStatus(limit); return; }
    const validation = resourceFileError(file, kind);
    if (validation) { setStatus(validation); return; }

    setUploading(kind);
    setStatus('자료 업로드 중…');
    onUploadPendingChange?.(1);
    try {
      const nextUrl = await uploadResource(file);
      uploadedUrls.current.add(nextUrl);
      setResources((current) => [...current, {
        id: crypto.randomUUID(),
        title: resourceTitle(file.name),
        kind,
        description: '',
        url: nextUrl,
      }]);
      setStatus('업로드 완료 · 제목이나 설명은 목록에서 수정할 수 있습니다.');
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : '업로드 실패');
    } finally {
      setUploading(null);
      onUploadPendingChange?.(-1);
    }
  };

  const addExternal = () => {
    const limit = resourceLimitError(resources.length);
    if (limit) { setStatus(limit); return; }
    const validation = externalResourceError(resources, linkTitle, linkUrl);
    if (validation) { setStatus(validation); return; }
    setResources((current) => [...current, {
      id: crypto.randomUUID(),
      title: linkTitle.trim(),
      kind: linkKind,
      description: linkDescription.trim(),
      url: new URL(linkUrl.trim()).href,
    }]);
    setLinkTitle('');
    setLinkKind('WEB');
    setLinkDescription('');
    setLinkUrl('');
    setLinkOpen(false);
    setStatus('');
  };

  const cancelExternal = () => {
    setLinkTitle('');
    setLinkKind('WEB');
    setLinkDescription('');
    setLinkUrl('');
    setLinkOpen(false);
    setStatus('');
  };

  const startEdit = (resource: SeminarResource) => {
    setEditingId(resource.id);
    setEditTitle(resource.title);
    setEditDescription(resource.description);
    setStatus('');
  };

  const finishEdit = () => {
    if (!editTitle.trim()) { setStatus('자료 제목을 입력해주세요.'); return; }
    setResources((current) => current.map((resource) => resource.id === editingId
      ? { ...resource, title: editTitle.trim(), description: editDescription.trim() }
      : resource));
    setEditingId(null);
    setStatus('');
  };

  const remove = async (resource: SeminarResource) => {
    setResources((current) => current.filter((item) => item.id !== resource.id));
    if (editingId === resource.id) setEditingId(null);
    if (uploadedUrls.current.has(resource.url)) {
      uploadedUrls.current.delete(resource.url);
      await removeMedia(resource.url);
    }
  };

  return <div className="resource-editor">
    <input type="hidden" name={name} value={JSON.stringify(resources)} />
    <strong>관련 자료 ({resources.length}/{MAX_SEMINAR_RESOURCES})</strong>
    <small>파일은 선택하면 바로 등록됩니다. 제목과 설명은 등록 후 수정할 수 있습니다.</small>

    {resources.length > 0 && <div className="resource-editor-list">{resources.map((resource) =>
      <article key={resource.id}>
        <b>{resource.kind}</b>
        {editingId === resource.id ? <div className="resource-edit-fields">
          <label>자료 제목<input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} /></label>
          <label>짧은 설명<textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} /></label>
          <div className="resource-card-actions">
            <button type="button" onClick={finishEdit}>완료</button>
            <button type="button" onClick={() => setEditingId(null)}>취소</button>
          </div>
        </div> : <>
          <div><strong>{resource.title}</strong><small>{resource.description || '설명 없음'}</small></div>
          <div className="resource-card-actions">
            <button type="button" onClick={() => startEdit(resource)}>수정</button>
            <button className="danger" type="button" onClick={() => remove(resource)}>삭제</button>
          </div>
        </>}
      </article>
    )}</div>}

    {!isFull ? <>
      <div className="resource-quick-actions">
        <label className="admin-action resource-upload-action" aria-disabled={Boolean(uploading)}>
          {uploading === 'PDF' ? '업로드 중…' : 'PDF 올리기'}
          <input
            type="file"
            disabled={Boolean(uploading)}
            accept=".pdf,application/pdf"
            onChange={(event) => upload(event, 'PDF')}
          />
        </label>
        <label className="admin-action resource-upload-action" aria-disabled={Boolean(uploading)}>
          {uploading === 'SLIDE' ? '업로드 중…' : 'PPT 올리기'}
          <input
            type="file"
            disabled={Boolean(uploading)}
            accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={(event) => upload(event, 'SLIDE')}
          />
        </label>
        <button
          className="admin-action"
          type="button"
          disabled={Boolean(uploading)}
          onClick={() => { setLinkOpen(true); setStatus(''); }}
        >
          외부 링크 추가
        </button>
      </div>

      {linkOpen && <div className="resource-link-form">
        <label>자료 제목<input value={linkTitle} onChange={(event) => setLinkTitle(event.target.value)} placeholder="세미나 발표 영상" /></label>
        <label>자료 종류<select value={linkKind} onChange={(event) => setLinkKind(event.target.value as ExternalKind)}>
          <option value="VIDEO">영상</option>
          <option value="WEB">웹 자료</option>
          <option value="CODE">코드</option>
        </select></label>
        <label>외부 링크<input type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://..." /></label>
        <label>짧은 설명<textarea value={linkDescription} onChange={(event) => setLinkDescription(event.target.value)} placeholder="자료에서 확인할 수 있는 내용을 적어주세요." /></label>
        <div className="resource-card-actions">
          <button className="admin-action" type="button" onClick={addExternal}>추가</button>
          <button className="admin-action" type="button" onClick={cancelExternal}>취소</button>
        </div>
      </div>}
    </> : <small>관련 자료는 최대 {MAX_SEMINAR_RESOURCES}개까지 등록할 수 있습니다.</small>}

    {status && <small className="upload-status">{status}</small>}
  </div>;
}
