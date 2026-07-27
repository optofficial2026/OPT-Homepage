import { supabase } from './supabase.ts';

const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export const mediaError = ({ type, size }: { type: string; size: number }) => {
  if (!TYPES.has(type)) return 'JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.';
  if (size > 5 * 1024 * 1024) return '이미지는 5MB 이하여야 합니다.';
  return '';
};

export const safeMediaPath = (folder: string, type: string, id = crypto.randomUUID()) =>
  `${folder.replace(/[^a-z0-9-]/g, '')}/${id}.${EXTENSIONS[type] ?? 'bin'}`;

export const mediaPathFromUrl = (url: string) => {
  const marker = 'content-media/';
  const index = url.lastIndexOf(marker);
  if (index < 0) return '';
  try {
    return decodeURIComponent(url.slice(index + marker.length).split(/[?#]/)[0]);
  } catch {
    return '';
  }
};

export async function uploadMedia(folder: string, file: File) {
  const validation = mediaError(file);
  if (validation) throw new Error(validation);
  if (!supabase) throw new Error('Supabase가 연결되지 않았습니다.');
  const path = safeMediaPath(folder, file.type);
  const { error } = await supabase.storage.from('content-media').upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from('content-media').getPublicUrl(path).data.publicUrl;
}

export async function removeMedia(url: string) {
  const path = mediaPathFromUrl(url);
  if (!path || !supabase) return;
  try {
    await supabase.storage.from('content-media').remove([path]);
  } catch {
    // Temporary upload cleanup is best effort.
  }
}
