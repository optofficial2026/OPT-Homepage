import { useState } from 'react';
import type { UploadPendingChange } from '../hooks/useEditorSafety';
import {
  MAX_IMAGE_SIZE_MB,
  mediaError,
  removeMedia,
  thumbnailCropRect,
  uploadMedia,
} from '../lib/media-storage';

const cropThumbnail = async (file: File) => {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
    });
    image.src = objectUrl;
    await loaded;

    const source = thumbnailCropRect(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('이미지를 자를 수 없습니다.');
    context.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((next) => next ? resolve(next) : reject(new Error('이미지를 변환하지 못했습니다.')), file.type, 0.9);
    });
    return new File([blob], file.name, { type: file.type, lastModified: file.lastModified });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

type Props = {
  label: string;
  name: string;
  folder: string;
  value?: string;
  description?: string;
  crop?: 'thumbnail';
  onUploadPendingChange?: UploadPendingChange;
};

export default function ImageUploadField({
  label,
  name,
  folder,
  value = '',
  description = '',
  crop,
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
      const validation = mediaError(file);
      if (validation) { setStatus(validation); event.currentTarget.value = ''; return; }
      setUploading(true);
      setStatus('업로드 중…');
      onUploadPendingChange?.(1);
      try {
        const nextFile = crop === 'thumbnail' ? await cropThumbnail(file) : file;
        const nextUrl = await uploadMedia(folder, nextFile);
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
