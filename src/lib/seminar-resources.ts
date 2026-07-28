import type { SeminarDetail, SeminarResource } from '../data/types';

export const MAX_SEMINAR_RESOURCES = 5;

export const resourceLimitError = (currentCount: number) =>
  currentCount >= MAX_SEMINAR_RESOURCES
    ? `관련 자료는 최대 ${MAX_SEMINAR_RESOURCES}개까지 등록할 수 있습니다.`
    : '';

const normalizedUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

export const externalResourceError = (
  resources: Pick<SeminarResource, 'url'>[],
  title: string,
  url: string,
) => {
  if (!title.trim()) return '자료 제목을 입력해주세요.';
  const nextUrl = normalizedUrl(url);
  if (!nextUrl) return 'http:// 또는 https://로 시작하는 링크를 입력해주세요.';
  return resources.some((item) => normalizedUrl(item.url) === nextUrl)
    ? '이미 등록된 링크입니다.'
    : '';
};

export const resourceAction = (kind: SeminarResource['kind']) => ({
  PDF: 'PDF 열기',
  SLIDE: '슬라이드 다운로드',
  VIDEO: '영상 보기',
  WEB: '웹 자료 보기',
  CODE: '코드 보기',
})[kind];

export const visibleSeminarResources = (detail: Pick<SeminarDetail, 'resources' | 'resourceUrl'>): SeminarResource[] => {
  const resources = (detail.resources ?? []).filter((item) => item.title && item.url).slice(0, MAX_SEMINAR_RESOURCES);
  if (resources.length) return resources;
  return detail.resourceUrl ? [{
    id: 'legacy-resource',
    title: '외부 자료',
    kind: 'WEB',
    description: '기존에 등록된 세미나 자료입니다.',
    url: detail.resourceUrl,
  }] : [];
};
