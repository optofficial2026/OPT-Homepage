export type ActivityTag = 'STUDY' | 'SEMINAR' | 'EVENT';
export type ArchiveKind = 'seminar' | 'hackathon';

export type SiteSettings = {
  recruitmentEnabled: boolean;
  recruitmentCohort: number;
  recruitmentCount: number;
  recruitmentFormUrl: string;
  recruitmentClosedMessage: string;
  activityCohorts: number;
  activityMembers: number;
  activityPrograms: number;
};

export type TimelineItem = {
  id: string;
  occurredOn: string;
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

export type SeminarDetail = {
  format: 'SLIDE' | 'NOTE';
  body: string;
  heroImageUrl: string;
  galleryUrls: string[];
  resourceUrl: string;
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
