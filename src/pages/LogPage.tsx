import { useState } from 'react';
import { activityLog, type ActivityTag } from '../data/content';

const filters = ['ALL', 'STUDY', 'SEMINAR', 'EVENT'] as const;
type Filter = typeof filters[number];
type CohortFilter = 'ALL' | (typeof activityLog)[number]['cohort'];

export default function LogPage() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [cohortFilter, setCohortFilter] = useState<CohortFilter>('ALL');
  const cohorts = ['ALL', ...new Set(activityLog.map((item) => item.cohort))] as CohortFilter[];
  const entries = activityLog.filter((item) => (filter === 'ALL' || item.tag === filter) && (cohortFilter === 'ALL' || item.cohort === cohortFilter));
  return <><section className="page-head"><div className="hero-grid" /><div className="wrap"><a className="back mono" href="/">← OPT HOME</a><p className="mono cyan">ACTIVITY LOG</p><h1>활동 기록</h1><div>스터디, 세미나, 행사에서 쌓은 기록입니다.</div></div></section><section className="wrap section"><div className="filters">{filters.map((item) => <button type="button" className={filter === item ? 'is-active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="filters" aria-label="기수 필터"><span className="mono cyan">기수</span>{cohorts.map((item) => <button type="button" className={cohortFilter === item ? 'is-active' : ''} key={item} onClick={() => setCohortFilter(item)}>{item === 'ALL' ? '전체' : item}</button>)}</div><div className="log-grid">{entries.map((item, index) => <article className="log-card" key={`${item.date}-${item.title}`}><div className={`image-slot slot-${index % 3}`}><span className={`tag tag-${item.tag.toLowerCase()}`}>{item.tag as ActivityTag}</span><span>{item.date}</span></div><div className="log-copy"><p>{item.date}</p><h2>{item.title}</h2><div>{item.desc}</div></div></article>)}</div></section></>;
}
