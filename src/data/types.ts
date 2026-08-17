export type ActivityTag = 'STUDY' | 'SEMINAR' | 'EVENT';
export type ArchiveKind = 'seminar' | 'hackathon';

export type SiteSettings = {
  recruitmentEnabled: boolean;
  recruitmentPopupEnabled: boolean;
  recruitmentCohort: number;
  recruitmentFormUrl: string;
  recruitmentClosedMessage: string;
  activityCohorts: number;
  activityMembers: number;
  activityPrograms: number;
};

export type TimelineItem = {
  id: string;
  /** 화면에 그대로 보이는 문구. '2026년 상반기'처럼 자유롭게 쓴다. */
  occurredOn: string;
  /** 정렬에만 쓰는 실제 날짜(YYYY-MM-DD). 비어 있으면 문구에서 추정한다. */
  sortedOn: string;
  title: string;
  description: string;
};

export type ActivityPost = {
  id: string;
  slug: string;
  tag: ActivityTag;
  cohort: number;
  occurredOn: string;
  title: string;
  summary: string;
  body: string;
  thumbnailUrl: string;
  heroImageUrl: string;
  galleryUrls: string[];
};

/** 활동 자료 항목. 사진과 본문 없이 자료 목록만 모은다. */
export type SeminarDetail = {
  format: 'SLIDE' | 'NOTE';
  resourceUrl: string;
  resources?: SeminarResource[];
};

export type SeminarResource = {
  id: string;
  title: string;
  kind: 'PDF' | 'SLIDE' | 'VIDEO' | 'WEB' | 'CODE';
  description: string;
  url: string;
};

export type HackathonDetail = {
  tagline: string;
  award: string;
  heroImageUrl: string;
  problem: string;
  solution: string;
  features: string[];
  galleryUrls: string[];
  process: string[];
  architecture: string;
  retrospective: string;
  result: string;
  techStack: string[];
  teamName: string;
  teamMembers: string[];
  githubUrl: string;
  demoUrl: string;
  presentationUrl: string;
};

export type ArchiveItem = {
  id: string;
  slug: string;
  kind: ArchiveKind;
  cohort: number;
  occurredOn: string;
  title: string;
  summary: string;
  thumbnailUrl: string;
  detail: SeminarDetail | HackathonDetail;
};

export type SiteContent = {
  settings: SiteSettings;
  timeline: TimelineItem[];
  activities: ActivityPost[];
  archives: ArchiveItem[];
};
