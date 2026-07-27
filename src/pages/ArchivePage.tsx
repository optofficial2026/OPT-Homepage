import { useState } from 'react';
import ArchiveEditor from '../components/ArchiveEditor';
import { useSite } from '../components/SiteContext';
import type { ArchiveItem, HackathonDetail } from '../data/types';
import { deleteArchiveItem } from '../lib/content-mutations';
import HackathonDetailPage from './HackathonDetailPage';
import SeminarDetailPage from './SeminarDetailPage';

export default function ArchivePage() {
  const { content, isEditMode, refetch } = useSite();
  const [cohortFilter, setCohortFilter] = useState<number | 'ALL'>('ALL');
  const [editing, setEditing] = useState<ArchiveItem | null | undefined>(undefined);
  const [newKind, setNewKind] = useState<ArchiveItem['kind']>('seminar');
  const id = new URLSearchParams(location.search).get('id');
  const selected = id ? content.archives.find((item) => item.slug === id) : null;
  if (selected) return <>{selected.kind === 'hackathon' ? <HackathonDetailPage item={selected} /> : <SeminarDetailPage item={selected} />}{isEditMode && <div className="detail-admin"><button className="admin-action" onClick={() => setEditing(selected)}>수정</button></div>}{editing && <ArchiveEditor value={editing} kind={editing.kind} close={() => setEditing(undefined)} />}</>;
  const cohorts = [...new Set(content.archives.map((item) => item.cohort))];
  const visible = content.archives.filter((item) => cohortFilter === 'ALL' || item.cohort === cohortFilter);
  const visibleSeminars = visible.filter((item) => item.kind === 'seminar');
  const visibleHackathons = visible.filter((item) => item.kind === 'hackathon');
  const actions = (item: ArchiveItem) => isEditMode && <div className="inline-actions"><button onClick={() => setEditing(item)}>수정</button><button onClick={async () => { if (confirm('삭제할까요?')) { await deleteArchiveItem(item.id); await refetch(); } }}>삭제</button></div>;
  return <><section className="page-head"><div className="hero-grid" /><div className="wrap"><a className="back mono" href="/">← OPT HOME</a><p className="mono cyan">ARCHIVE</p><h1>자료 아카이브</h1><div>OPT가 쌓아온 세미나와 해커톤 결과물입니다.</div></div></section><section className="wrap archive-section"><div className="filters" aria-label="기수 필터"><span className="mono cyan">기수</span><button className={cohortFilter === 'ALL' ? 'is-active' : ''} onClick={() => setCohortFilter('ALL')}>전체</button>{cohorts.map((cohort) => <button className={cohortFilter === cohort ? 'is-active' : ''} key={cohort} onClick={() => setCohortFilter(cohort)}>{cohort}기</button>)}</div><div className="section-title section-heading"><div><p className="mono cyan">SEMINARS</p><h2>세미나 자료</h2></div>{isEditMode && <button className="admin-action" onClick={() => { setNewKind('seminar'); setEditing(null); }}>세미나 추가</button>}</div><div className="seminar-list">{visibleSeminars.map((item) => <article className="seminar-row-wrap" key={item.id}><a className="seminar-row" href={`/archive/?id=${encodeURIComponent(item.slug)}`}><span>{item.occurredOn}</span><b>SLIDE</b><strong>{item.title}</strong><i>↗</i></a>{actions(item)}</article>)}</div></section><section className="wrap archive-section"><div className="section-title section-heading"><div><p className="mono cyan">HACKATHONS</p><h2>해커톤 결과물</h2></div>{isEditMode && <button className="admin-action" onClick={() => { setNewKind('hackathon'); setEditing(null); }}>해커톤 추가</button>}</div><div className="hack-grid">{visibleHackathons.map((item) => { const detail = item.detail as HackathonDetail; return <article className="hack-card" key={item.id}><a href={`/archive/?id=${encodeURIComponent(item.slug)}`}><div><h3>{item.title}</h3><span>{item.occurredOn}</span></div><p>{item.summary}</p><div className="tech-list">{detail.techStack.map((tech) => <i key={tech}>{tech}</i>)}</div><footer>자세히 보기 →</footer></a>{actions(item)}</article>; })}</div></section>{id && !selected && <p className="wrap not-found">해당 아카이브를 찾지 못했습니다.</p>}{editing !== undefined && <ArchiveEditor value={editing ?? undefined} kind={editing?.kind ?? newKind} close={() => setEditing(undefined)} />}</>;
}
