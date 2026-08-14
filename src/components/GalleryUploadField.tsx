import { useRef, useState, type ChangeEvent } from 'react';
import type { UploadPendingChange } from '../hooks/useEditorSafety';
import {
  MAX_GALLERY_IMAGES,
  MAX_IMAGE_SIZE_MB,
  galleryLimitError,
  mediaError,
  removeMedia,
  uploadMedia,
} from '../lib/media-storage';

type Props = {
  name: string;
  folder: string;
  value?: string[];
  description: string;
  onUploadPendingChange?: UploadPendingChange;
};

export default function GalleryUploadField({
  name,
  folder,
  value = [],
  description,
  onUploadPendingChange,
}: Props) {
  const [urls, setUrls] = useState(value.slice(0, MAX_GALLERY_IMAGES));
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const uploadedUrls = useRef(new Set<string>());

  const uploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const limitError = galleryLimitError(urls.length, files.length);
    if (limitError) { setStatus(limitError); input.value = ''; return; }
    const validation = files.map(mediaError).find(Boolean);
    if (validation) { setStatus(validation); input.value = ''; return; }

    setUploading(true);
    setStatus('업로드 중…');
    onUploadPendingChange?.(1);
    let nextUrls = [...urls];
    try {
      for (const file of files) {
        const nextUrl = await uploadMedia(folder, file);
        uploadedUrls.current.add(nextUrl);
        nextUrls = [...nextUrls, nextUrl];
        setUrls(nextUrls);
      }
      setStatus(`${nextUrls.length}장 업로드 완료`);
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : '업로드 실패');
    } finally {
      setUploading(false);
      onUploadPendingChange?.(-1);
      input.value = '';
    }
  };

  const remove = async (url: string) => {
    setUrls((current) => current.filter((item) => item !== url));
    if (uploadedUrls.current.has(url)) {
      uploadedUrls.current.delete(url);
      await removeMedia(url);
    }
    setStatus('');
  };

  return <div className="gallery-upload-field">
    <strong>상세 사진</strong>
    <small>{description}</small>
    <input type="hidden" name={name} value={urls.join('\n')} />
    {urls.length > 0 && <div className="gallery-upload-grid">{urls.map((url, index) =>
      <figure key={url}>
        <img src={url} alt={`상세 사진 ${index + 1}`} />
        <figcaption>{index + 1}</figcaption>
        <button type="button" onClick={() => remove(url)} aria-label={`상세 사진 ${index + 1} 삭제`}>삭제</button>
      </figure>
    )}</div>}
    <label className="file-upload-button">
      사진 선택 ({MAX_GALLERY_IMAGES - urls.length}장 추가 가능)
      <input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={uploading || urls.length >= MAX_GALLERY_IMAGES} onChange={uploadFiles} />
    </label>
    <small>JPEG, PNG, WebP · 장당 {MAX_IMAGE_SIZE_MB}MB 이하</small>
    {status && <small className="upload-status">{status}</small>}
  </div>;
}
