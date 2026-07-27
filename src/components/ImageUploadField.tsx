import { useState } from 'react';
import { removeMedia, uploadMedia } from '../lib/media-storage';

export default function ImageUploadField({ label, name, folder, value = '' }: { label: string; name: string; folder: string; value?: string }) {
  const [url, setUrl] = useState(value);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [status, setStatus] = useState('');
  return <label>{label}
    <input name={name} type="url" value={url} onChange={(event) => setUrl(event.target.value)} />
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
    {status && <small>{status}</small>}
  </label>;
}
