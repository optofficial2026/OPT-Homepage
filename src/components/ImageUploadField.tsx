import { useState } from 'react';
import { removeMedia, uploadMedia } from '../lib/media-storage';

export default function ImageUploadField({ label, name, folder, value = '', description = '' }: { label: string; name: string; folder: string; value?: string; description?: string }) {
  const [url, setUrl] = useState(value);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [status, setStatus] = useState('');
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
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (event) => {
      const file = event.target.files?.[0]; if (!file) return;
      setStatus('업로드 중…');
      try {
        const nextUrl = await uploadMedia(folder, file);
        if (uploadedUrl) await removeMedia(uploadedUrl);
        setUploadedUrl(nextUrl); setUrl(nextUrl); setStatus('업로드 완료');
      }
      catch (reason) { setStatus(reason instanceof Error ? reason.message : '업로드 실패'); }
      }} />
    </label>
    <small>JPEG, PNG, WebP · 5MB 이하</small>
    {url && <button className="upload-remove" type="button" onClick={clearImage}>사진 삭제</button>}
    {status && <small className="upload-status">{status}</small>}
  </div>;
}
