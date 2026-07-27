import { supabase } from './supabase.ts';

const MAX_BYTES = 20 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
};

export const resourceFileError = ({ type, size, name = '' }: { type: string; size: number; name?: string }) => {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  if (!EXTENSIONS[type] && !['pdf', 'ppt', 'pptx'].includes(extension)) return 'PDF, PPT, PPTX 파일만 업로드할 수 있습니다.';
  if (size > MAX_BYTES) return '자료 파일은 20MB 이하여야 합니다.';
  return '';
};

export async function uploadResource(file: File) {
  const validation = resourceFileError(file);
  if (validation) throw new Error(validation);
  if (!supabase) throw new Error('Supabase가 연결되지 않았습니다.');
  const extension = EXTENSIONS[file.type] ?? file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const path = `resources/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('content-media').upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from('content-media').getPublicUrl(path).data.publicUrl;
}
