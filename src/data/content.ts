import type { ActivityPost, ArchiveItem, SiteContent, TimelineItem as DynamicTimelineItem } from './types';

export type ActivityTag = 'STUDY' | 'SEMINAR' | 'EVENT';
export type Cohort = '1기';

export type Activity = { tag: ActivityTag; cohort: Cohort; date: string; title: string; desc: string };
export type TimelineItem = { date: string; title: string; body: string };
export type Seminar = { cohort: Cohort; date: string; type: 'SLIDE' | 'NOTE'; title: string };
export type Hackathon = { cohort: Cohort; name: string; date: string; desc: string; tech: string[] };

export const activityLog: Activity[] = [
  { tag: 'SEMINAR', cohort: '1기', date: '2025.11', title: 'Transformer 구조 뜯어보기', desc: '어텐션부터 인코더·디코더까지 함께 파봤습니다.' },
  { tag: 'STUDY', cohort: '1기', date: '2025.10', title: '밑바닥부터 시작하는 딥러닝', desc: '3주차 · 신경망 학습과 역전파.' },
  { tag: 'EVENT', cohort: '1기', date: '2025.12', title: '5기 데모데이 현장', desc: '한 학기 결과물을 함께 발표했습니다.' },
  { tag: 'SEMINAR', cohort: '1기', date: '2025.09', title: 'Diffusion 모델 리뷰', desc: '생성모델의 원리를 뜯어봤습니다.' },
  { tag: 'STUDY', cohort: '1기', date: '2025.09', title: 'AI를 위한 선형대수', desc: '이론 스터디를 위한 수학 기초 다지기.' },
  { tag: 'EVENT', cohort: '1기', date: '2025.08', title: '여름 아이디어 세션', desc: '해커톤 준비 브레인스토밍 — 업데이트 예정.' },
];

export const timeline: TimelineItem[] = [
  { date: '2026.09', title: '2기 부원 모집', body: '2026년 9월부터 활동 예정입니다.' },
  { date: '2026년 하반기', title: '후반부', body: '기술 세미나, 논문 세미나, 해커톤을 진행합니다.' },
  { date: '2026년 여름방학', title: '여름방학', body: '개별 스터디 모임, 바이브 코딩, AI 공모전 참가 등 다양한 소모임을 진행 중입니다.' },
  { date: '2026년 상반기', title: '전반부', body: '개념 스터디 4회를 진행합니다.' },
  { date: '2026.03.07', title: 'OPT 시작', body: '외대 유일의, 그리고 최고의 AI 학회가 되고자 모였습니다.' },
];

export const seminars: Seminar[] = [
  { cohort: '1기', date: '2025.11', type: 'SLIDE', title: 'Transformer 구조 뜯어보기' },
  { cohort: '1기', date: '2025.09', type: 'SLIDE', title: 'Diffusion 모델 리뷰' },
  { cohort: '1기', date: '2025.06', type: 'NOTE', title: '강화학습 기초 세미나' },
  { cohort: '1기', date: '2025.04', type: 'SLIDE', title: 'CNN부터 ViT까지' },
  { cohort: '1기', date: '2025.03', type: 'NOTE', title: '확률·통계 리마인드 세션' },
];

export const hackathons: Hackathon[] = [
  { cohort: '1기', name: 'PaperPilot', date: '2025.12', desc: '논문 PDF를 요약하고 핵심을 질문할 수 있는 리서치 보조 도구.', tech: ['Python', 'LangChain', 'React'] },
  { cohort: '1기', name: 'StudyLoop', date: '2025.08', desc: '스터디 진도와 회고를 기록하는 학습 트래커.', tech: ['Next.js', 'Supabase'] },
  { cohort: '1기', name: '업데이트 예정', date: '—', desc: '다음 해커톤 결과물이 이곳에 추가됩니다.', tech: ['UPCOMING'] },
  { cohort: '1기', name: '업데이트 예정', date: '—', desc: '다음 해커톤 결과물이 이곳에 추가됩니다.', tech: ['UPCOMING'] },
];

export const normalizeStat = (value: number) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
export const formatStat = (value: number) => `${normalizeStat(value)}+`;
export const validateSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
export const sortTimelineNewestFirst = <T extends DynamicTimelineItem>(items: T[]) =>
  [...items].sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));

const defaultActivities: ActivityPost[] = activityLog.map((item, index) => ({
  id: `activity-${index + 1}`,
  slug: `activity-${index + 1}`,
  tag: item.tag,
  cohort: 1,
  occurredOn: `${item.date.replace('.', '-')}-01`,
  title: item.title,
  summary: item.desc,
  body: item.desc,
  thumbnailUrl: '',
  heroImageUrl: '',
  galleryUrls: [],
}));

const defaultArchives: ArchiveItem[] = [
  ...seminars.map((item, index): ArchiveItem => ({
    id: `seminar-${index + 1}`,
    slug: `seminar-${index + 1}`,
    kind: 'seminar',
    cohort: 1,
    occurredOn: `${item.date.replace('.', '-')}-01`,
    title: item.title,
    summary: `${item.type} 자료`,
    thumbnailUrl: '',
    detail: { body: '세미나 상세 내용이 준비 중입니다.', heroImageUrl: '', galleryUrls: [], resourceUrl: '' },
  })),
  ...hackathons.map((item, index): ArchiveItem => ({
    id: `hackathon-${index + 1}`,
    slug: `hackathon-${index + 1}`,
    kind: 'hackathon',
    cohort: 1,
    occurredOn: item.date === '—' ? '2025-01-01' : `${item.date.replace('.', '-')}-01`,
    title: item.name,
    summary: item.desc,
    thumbnailUrl: '',
    detail: {
      tagline: item.desc,
      award: '',
      heroImageUrl: '',
      problem: '',
      solution: '',
      features: [],
      galleryUrls: [],
      process: [],
      architecture: '',
      retrospective: '',
      result: '',
      techStack: item.tech,
      teamName: '',
      teamMembers: [],
      githubUrl: '',
      demoUrl: '',
      presentationUrl: '',
    },
  })),
];

export const defaultContent: SiteContent = {
  settings: {
    recruitmentEnabled: true,
    recruitmentCohort: 2,
    recruitmentCount: 0,
    recruitmentFormUrl: '',
    recruitmentClosedMessage: '현재는 모집 중이 아닙니다. 다음 기수 지원 때 다시 찾아주세요.',
    activityCohorts: 1,
    activityMembers: 11,
    activityPrograms: 4,
  },
  timeline: timeline.map((item, index) => ({
    id: `timeline-${index + 1}`,
    occurredOn: item.date,
    title: item.title,
    description: item.body,
  })),
  activities: defaultActivities,
  archives: defaultArchives,
};
