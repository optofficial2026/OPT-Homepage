import { useState } from 'react';
import type { UploadPendingChange } from '../hooks/useEditorSafety';
import { MAX_IMAGE_SIZE_MB, removeMedia, uploadMedia } from '../lib/media-storage';

type Props = {
  label: string;
  name: string;
  folder: string;
  value?: string;
  description?: string;
  onUploadPendingChange?: UploadPendingChange;
};

export default function ImageUploadField({
  label,
  name,
  folder,
  value = '',
  description = '',
  onUploadPendingChange,
}: Props) {
  const [url, setUrl] = useState(value);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const clearImage = async () => {
    if (uploadedUrl) await removeMedia(uploadedUrl);
    setUploadedUrl(''); setUrl(''); setStatus('');
  };
  return <div className="single-upload-field">
    <strong>{label}</strong>
    {description && <small>{description}</small>}
    <input name={name} type="hidden" value={url} />
    {url && <img className="single-upload-preview" src={url} alt="" />}
    <label className="file-upload-button">사진 선택
      <input type="file" disabled={uploading} accept="image/jpeg,image/png,image/webp" onChange={async (event) => {
      const file = event.target.files?.[0]; if (!file) return;
      setUploading(true);
      setStatus('업로드 중…');
      onUploadPendingChange?.(1);
      try {
        const nextUrl = await uploadMedia(folder, file);
        if (uploadedUrl) await removeMedia(uploadedUrl);
        setUploadedUrl(nextUrl); setUrl(nextUrl); setStatus('업로드 완료');
      }
      catch (reason) { setStatus(reason instanceof Error ? reason.message : '업로드 실패'); }
      finally { setUploading(false); onUploadPendingChange?.(-1); }
      }} />
    </label>
    <small>JPEG, PNG, WebP · 장당 {MAX_IMAGE_SIZE_MB}MB 이하</small>
    {url && <button className="upload-remove" type="button" onClick={clearImage}>사진 삭제</button>}
    {status && <small className="upload-status">{status}</small>}
  </div>;
}
