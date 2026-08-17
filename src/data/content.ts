import type {
  ActivityPost,
  ArchiveItem,
  HackathonDetail,
  SeminarDetail,
  SiteContent,
  TimelineItem as DynamicTimelineItem,
} from './types';

// Seed rows for the bundled fallback content. defaultContent below is the only public shape.
type Cohort = '1기';
type Activity = { tag: ActivityPost['tag']; cohort: Cohort; date: string; title: string; desc: string };
type Period = { date: string; title: string; body: string };
type Seminar = { cohort: Cohort; date: string; type: SeminarDetail['format']; title: string };
type Hackathon = { cohort: Cohort; name: string; date: string; desc: string; tech: string[] };

const activityLog: Activity[] = [
  { tag: 'SEMINAR', cohort: '1기', date: '2025.11', title: 'Transformer 구조 뜯어보기', desc: '어텐션부터 인코더·디코더까지 함께 파봤습니다.' },
  { tag: 'STUDY', cohort: '1기', date: '2025.10', title: '밑바닥부터 시작하는 딥러닝', desc: '3주차 · 신경망 학습과 역전파.' },
  { tag: 'EVENT', cohort: '1기', date: '2025.12', title: '5기 데모데이 현장', desc: '한 학기 결과물을 함께 발표했습니다.' },
  { tag: 'SEMINAR', cohort: '1기', date: '2025.09', title: 'Diffusion 모델 리뷰', desc: '생성모델의 원리를 뜯어봤습니다.' },
  { tag: 'STUDY', cohort: '1기', date: '2025.09', title: 'AI를 위한 선형대수', desc: '이론 스터디를 위한 수학 기초 다지기.' },
  { tag: 'EVENT', cohort: '1기', date: '2025.08', title: '여름 아이디어 세션', desc: '해커톤 준비 브레인스토밍 — 업데이트 예정.' },
];

const timeline: Period[] = [
  { date: '2026.09', title: '2기 부원 모집', body: '2026년 9월부터 활동 예정입니다.' },
  { date: '2026년 하반기', title: '후반부', body: '기술 세미나, 논문 세미나, 해커톤을 진행합니다.' },
  { date: '2026년 여름방학', title: '여름방학', body: '개별 스터디 모임, 바이브 코딩, AI 공모전 참가 등 다양한 소모임을 진행 중입니다.' },
  { date: '2026년 상반기', title: '전반부', body: '개념 스터디 4회를 진행합니다.' },
  { date: '2026.03.07', title: 'OPT 시작', body: '외대 유일의, 그리고 최고의 AI 학회가 되고자 모였습니다.' },
];

const seminars: Seminar[] = [
  { cohort: '1기', date: '2025.11', type: 'SLIDE', title: 'Transformer 구조 뜯어보기' },
  { cohort: '1기', date: '2025.09', type: 'SLIDE', title: 'Diffusion 모델 리뷰' },
  { cohort: '1기', date: '2025.06', type: 'NOTE', title: '강화학습 기초 세미나' },
  { cohort: '1기', date: '2025.04', type: 'SLIDE', title: 'CNN부터 ViT까지' },
  { cohort: '1기', date: '2025.03', type: 'NOTE', title: '확률·통계 리마인드 세션' },
];

const hackathons: Hackathon[] = [
  { cohort: '1기', name: 'PaperPilot', date: '2025.12', desc: '논문 PDF를 요약하고 핵심을 질문할 수 있는 리서치 보조 도구.', tech: ['Python', 'LangChain', 'React'] },
  { cohort: '1기', name: 'StudyLoop', date: '2025.08', desc: '스터디 진도와 회고를 기록하는 학습 트래커.', tech: ['Next.js', 'Supabase'] },
  { cohort: '1기', name: '업데이트 예정', date: '—', desc: '다음 해커톤 결과물이 이곳에 추가됩니다.', tech: ['UPCOMING'] },
  { cohort: '1기', name: '업데이트 예정', date: '—', desc: '다음 해커톤 결과물이 이곳에 추가됩니다.', tech: ['UPCOMING'] },
];

export const displayDate = (value: string) => value.slice(0, 7).replace('-', '.');
export const validateSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
// Rows saved before the sort date existed still carry the season wording, so keep guessing for those.
const guessedKey = (value: string) => value
  .replace('년 하반기', '.12')
  .replace('년 여름방학', '.08')
  .replace('년 상반기', '.06')
  .replace(/[.-]/g, '')
  .padEnd(8, '0');
export const timelineSortKey = ({ sortedOn, occurredOn }: Pick<DynamicTimelineItem, 'sortedOn' | 'occurredOn'>) =>
  sortedOn ? sortedOn.replace(/-/g, '') : guessedKey(occurredOn);

// ponytail: 정렬 날짜와 표시 문구를 occurred_on(text) 한 칸에 'YYYY-MM-DD|문구'로 함께 담는다.
// 표를 바꿀 권한 없이도 날짜 정렬이 되게 하는 방법이다. 전용 date 칸을 만들 수 있게 되면
// 그 칸으로 옮기고 이 두 함수만 지우면 된다.
const PACKED = /^(\d{4}-\d{2}-\d{2})\|([\s\S]*)$/;

export const packTimelineDate = (sortedOn: string, occurredOn: string) =>
  sortedOn ? `${sortedOn}|${occurredOn}` : occurredOn;

export const unpackTimelineDate = (stored: string) => {
  const packed = PACKED.exec(stored);
  if (!packed) return { sortedOn: '', occurredOn: stored };
  const [, sortedOn, label] = packed;
  return { sortedOn, occurredOn: label.trim() || sortedOn };
};
export const sortTimelineNewestFirst = <T extends DynamicTimelineItem>(items: T[]) =>
  [...items].sort((a, b) => timelineSortKey(b).localeCompare(timelineSortKey(a)));

// Stored detail is free-form jsonb, so every reader starts from a complete shape.
export const emptySeminarDetail: SeminarDetail = {
  format: 'SLIDE',
  resourceUrl: '',
  resources: [],
};

export const emptyHackathonDetail: HackathonDetail = {
  tagline: '',
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
  techStack: [],
  teamName: '',
  teamMembers: [],
  githubUrl: '',
  demoUrl: '',
  presentationUrl: '',
};

export const completeDetail = (kind: ArchiveItem['kind'], detail: unknown): ArchiveItem['detail'] => ({
  ...(kind === 'hackathon' ? emptyHackathonDetail : emptySeminarDetail),
  ...(detail && typeof detail === 'object' && !Array.isArray(detail) ? detail : {}),
});

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
    detail: { ...emptySeminarDetail, format: item.type },
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
    detail: { ...emptyHackathonDetail, tagline: item.desc, techStack: item.tech },
  })),
];

export const defaultContent: SiteContent = {
  settings: {
    recruitmentEnabled: true,
    recruitmentPopupEnabled: true,
    recruitmentCohort: 2,
    recruitmentFormUrl: '',
    recruitmentClosedMessage: '현재는 모집 중이 아닙니다. 다음 기수 지원 때 다시 찾아주세요.',
    activityCohorts: 1,
    activityMembers: 11,
    activityPrograms: 4,
  },
  timeline: timeline.map((item, index) => ({
    id: `timeline-${index + 1}`,
    occurredOn: item.date,
    sortedOn: '',
    title: item.title,
    description: item.body,
  })),
  activities: defaultActivities,
  archives: defaultArchives,
};
