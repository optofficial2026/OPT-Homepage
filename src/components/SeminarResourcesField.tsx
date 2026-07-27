import { useRef, useState, type ChangeEvent } from 'react';
import type { SeminarResource } from '../data/types';
import { removeMedia } from '../lib/media-storage';
import { MAX_SEMINAR_RESOURCES, resourceLimitError } from '../lib/seminar-resources';
import { resourceFileError, uploadResource } from '../lib/resource-storage';

export default function SeminarResourcesField({ name, value = [] }: { name: string; value?: SeminarResource[] }) {
  const [resources, setResources] = useState(value.slice(0, MAX_SEMINAR_RESOURCES));
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<SeminarResource['kind']>('PDF');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const uploadedUrls = useRef(new Set<string>());

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const validation = resourceFileError(file);
    if (validation) { setStatus(validation); return; }
    setStatus('자료 업로드 중…');
    try {
      const nextUrl = await uploadResource(file);
      uploadedUrls.current.add(nextUrl);
      setUrl(nextUrl);
      setKind(file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'SLIDE');
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
      setStatus('업로드 완료 · 아래 ‘자료 추가’를 눌러주세요.');
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : '업로드 실패');
    }
  };

  const add = () => {
    const limit = resourceLimitError(resources.length);
    if (limit) { setStatus(limit); return; }
    if (!title.trim() || !url.trim()) { setStatus('자료 제목과 파일 또는 링크를 입력해주세요.'); return; }
    setResources((current) => [...current, {
      id: crypto.randomUUID(),
      title: title.trim(),
      kind,
      description: description.trim(),
      url: url.trim(),
    }]);
    setTitle(''); setDescription(''); setUrl(''); setStatus('');
  };

  const remove = async (resource: SeminarResource) => {
    setResources((current) => current.filter((item) => item.id !== resource.id));
    if (uploadedUrls.current.has(resource.url)) {
      uploadedUrls.current.delete(resource.url);
      await removeMedia(resource.url);
    }
  };

  return <div className="resource-editor">
    <input type="hidden" name={name} value={JSON.stringify(resources)} />
    <strong>관련 자료 ({resources.length}/{MAX_SEMINAR_RESOURCES})</strong>
    <small>자료의 종류와 설명이 상세 페이지 카드에 그대로 표시됩니다.</small>
    {resources.length > 0 && <div className="resource-editor-list">{resources.map((resource) =>
      <article key={resource.id}><b>{resource.kind}</b><div><strong>{resource.title}</strong><small>{resource.description || '설명 없음'}</small></div><button type="button" onClick={() => remove(resource)}>삭제</button></article>
    )}</div>}
    <div className="resource-draft">
      <label>자료 제목<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="3주차 Transformer 발표자료" /></label>
      <label>자료 종류<select value={kind} onChange={(event) => setKind(event.target.value as SeminarResource['kind'])}><option value="PDF">PDF</option><option value="SLIDE">PPT·PPTX</option><option value="VIDEO">영상</option><option value="WEB">노션·웹</option><option value="CODE">코드</option></select></label>
      <label>짧은 설명<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Attention 구조와 실습 예제를 정리한 자료" /></label>
      <label>외부 링크<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." /></label>
      <label className="file-upload-button">PDF·PPT 파일 직접 올리기<input type="file" accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={upload} /></label>
      <button className="admin-action" type="button" onClick={add} disabled={resources.length >= MAX_SEMINAR_RESOURCES}>자료 추가</button>
    </div>
    {status && <small className="upload-status">{status}</small>}
  </div>;
}
