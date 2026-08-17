import { supabase } from './supabase.ts';

const MAX_BYTES = 20 * 1024 * 1024;
const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};
const EXTENSIONS: Record<string, string> = Object.fromEntries(
  Object.entries(MIME_BY_EXTENSION).map(([extension, type]) => [type, extension]),
);

const fileExtension = ({ type, name = '' }: { type: string; name?: string }) =>
  EXTENSIONS[type] ?? name.split('.').pop()?.toLowerCase() ?? '';

export const resourceTitle = (fileName: string) =>
  fileName.replace(/\.[^.]+$/, '').trim() || '활동 자료';

export const resourceFileError = (
  file: { type: string; size: number; name?: string },
  expectedKind?: 'PDF' | 'SLIDE',
) => {
  const extension = fileExtension(file);
  if (expectedKind === 'PDF' && extension !== 'pdf') return 'PDF 파일만 선택해주세요.';
  if (expectedKind === 'SLIDE' && !['ppt', 'pptx'].includes(extension)) {
    return 'PPT 또는 PPTX 파일만 선택해주세요.';
  }
  if (!MIME_BY_EXTENSION[extension]) return 'PDF, PPT, PPTX 파일만 업로드할 수 있습니다.';
  if (file.size > MAX_BYTES) return '자료 파일은 20MB 이하여야 합니다.';
  return '';
};

export async function uploadResource(file: File) {
  const validation = resourceFileError(file);
  if (validation) throw new Error(validation);
  if (!supabase) throw new Error('Supabase가 연결되지 않았습니다.');
  const extension = fileExtension(file);
  const path = `resources/${crypto.randomUUID()}.${extension}`;
  // Browsers report an empty or wrong type for .ppt/.pptx, and the bucket rejects that type.
  const { error } = await supabase.storage.from('content-media')
    .upload(path, file, { upsert: false, contentType: MIME_BY_EXTENSION[extension] });
  if (error) throw new Error(error.message);
  return supabase.storage.from('content-media').getPublicUrl(path).data.publicUrl;
}
