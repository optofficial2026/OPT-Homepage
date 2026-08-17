import type { ArchiveItem, SeminarDetail } from '../data/types';
import DetailSection from '../components/DetailSection';
import { sitePath } from '../lib/paths';
import { displayDate } from '../data/content';
import { resourceAction, visibleSeminarResources } from '../lib/seminar-resources';

export default function SeminarDetailPage({ item }: { item: ArchiveItem }) {
  const resources = visibleSeminarResources(item.detail as SeminarDetail);
  return <main className="detail-page">
    <header className="detail-hero"><div className="wrap">
      <a className="back mono" href={sitePath('/archive/')}>← 아카이브</a>
      <p className="mono cyan">ACTIVITY · {item.cohort}기 · {displayDate(item.occurredOn)}</p>
      <h1>{item.title}</h1>
      <p>{item.summary}</p>
    </div></header>
    <article className="wrap detail-content">
      <DetailSection eyebrow="01 / RESOURCE" title="관련 자료" empty={resources.length === 0}>
        <div className="resource-card-grid">{resources.map((resource) =>
          <article className="resource-card" key={resource.id}>
            <b>{resource.kind}</b>
            <h3>{resource.title}</h3>
            <p>{resource.description || '설명이 준비 중입니다.'}</p>
            <a href={resource.url} target="_blank" rel="noreferrer" aria-label={`${resource.title} ${resourceAction(resource.kind)}`}>
              {resourceAction(resource.kind)} ↗
            </a>
          </article>
        )}</div>
      </DetailSection>
    </article>
  </main>;
}
