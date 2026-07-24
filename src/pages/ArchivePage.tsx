import { useState } from 'react';
import { hackathons, seminars } from '../data/content';

type CohortFilter = 'ALL' | (typeof seminars)[number]['cohort'] | (typeof hackathons)[number]['cohort'];

export default function ArchivePage() {
  const [cohortFilter, setCohortFilter] = useState<CohortFilter>('ALL');
  const cohorts = ['ALL', ...new Set([...seminars, ...hackathons].map((item) => item.cohort))] as CohortFilter[];
  const visibleSeminars = seminars.filter((item) => cohortFilter === 'ALL' || item.cohort === cohortFilter);
  const visibleHackathons = hackathons.filter((item) => cohortFilter === 'ALL' || item.cohort === cohortFilter);
  return <><section className="page-head"><div className="hero-grid" /><div className="wrap"><a className="back mono" href="/">← OPT HOME</a><p className="mono cyan">ARCHIVE</p><h1>자료 아카이브</h1><div>OPT가 쌓아온 세미나와 해커톤 결과물입니다.</div></div></section><section className="wrap archive-section"><div className="filters" aria-label="기수 필터"><span className="mono cyan">기수</span>{cohorts.map((item) => <button type="button" className={cohortFilter === item ? 'is-active' : ''} key={item} onClick={() => setCohortFilter(item)}>{item === 'ALL' ? '전체' : item}</button>)}</div><div className="section-title"><p className="mono cyan">SEMINARS</p><h2>세미나 자료</h2></div><div className="seminar-list">{visibleSeminars.map((item) => <article className="seminar-row" key={`${item.date}-${item.title}`}><span>{item.date}</span><b>{item.type}</b><strong>{item.title}</strong><i>↗</i></article>)}</div><p className="archive-note">링크가 준비된 자료부터 순차적으로 공개됩니다.</p></section><section className="wrap archive-section"><div className="section-title"><p className="mono cyan">HACKATHONS</p><h2>해커톤 결과물</h2></div><div className="hack-grid">{visibleHackathons.map((item, index) => <article className="hack-card" key={`${item.name}-${index}`}><div><h3>{item.name}</h3><span>{item.date}</span></div><p>{item.desc}</p><div className="tech-list">{item.tech.map((tech) => <i key={tech}>{tech}</i>)}</div><footer>공개 링크 준비 중</footer></article>)}</div></section></>;
}
