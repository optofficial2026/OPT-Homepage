import { useState } from 'react';
import ActivityEditor from '../components/ActivityEditor';
import { useSite } from '../components/SiteContext';
import { deleteActivityPost } from '../lib/content-mutations';
import type { ActivityPost, ActivityTag } from '../data/types';
import ActivityDetailPage from './ActivityDetailPage';

const filters = ['ALL', 'STUDY', 'SEMINAR', 'EVENT'] as const;
type Filter = typeof filters[number];

export default function LogPage() {
  const { content, isEditMode, refetch } = useSite();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [cohortFilter, setCohortFilter] = useState<number | 'ALL'>('ALL');
  const [editing, setEditing] = useState<ActivityPost | null | undefined>(undefined);
  const id = new URLSearchParams(location.search).get('id');
  const selected = id ? content.activities.find((item) => item.slug === id) : null;
  if (selected) return <><ActivityDetailPage item={selected} />{isEditMode && <div className="detail-admin"><button className="admin-action" onClick={() => setEditing(selected)}>수정</button></div>}{editing && <ActivityEditor value={editing} close={() => setEditing(undefined)} />}</>;
  const cohorts = [...new Set(content.activities.map((item) => item.cohort))];
  const entries = content.activities.filter((item) => (filter === 'ALL' || item.tag === filter) && (cohortFilter === 'ALL' || item.cohort === cohortFilter));
  return <><section className="page-head"><div className="hero-grid" /><div className="wrap"><a className="back mono" href="/">← OPT HOME</a><p className="mono cyan">ACTIVITY LOG</p><h1>활동 기록</h1><div>스터디, 세미나, 행사에서 쌓은 기록입니다.</div></div></section><section className="wrap section"><div className="section-heading"><div className="filters">{filters.map((item) => <button type="button" className={filter === item ? 'is-active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>{isEditMode && <button className="admin-action" type="button" onClick={() => setEditing(null)}>새 활동 기록</button>}</div><div className="filters" aria-label="기수 필터"><span className="mono cyan">기수</span><button className={cohortFilter === 'ALL' ? 'is-active' : ''} onClick={() => setCohortFilter('ALL')}>전체</button>{cohorts.map((cohort) => <button type="button" className={cohortFilter === cohort ? 'is-active' : ''} key={cohort} onClick={() => setCohortFilter(cohort)}>{cohort}기</button>)}</div><div className="log-grid">{entries.map((item, index) => <article className="log-card" key={item.id}><a href={`/log/?id=${encodeURIComponent(item.slug)}`}><div className={`image-slot slot-${index % 3}`} style={item.thumbnailUrl ? { backgroundImage: `url(${item.thumbnailUrl})`, backgroundSize: 'cover' } : undefined}><span className={`tag tag-${item.tag.toLowerCase()}`}>{item.tag as ActivityTag}</span><span>{item.occurredOn}</span></div><div className="log-copy"><p>{item.occurredOn}</p><h2>{item.title}</h2><div>{item.summary}</div></div></a>{isEditMode && <div className="inline-actions"><button onClick={() => setEditing(item)}>수정</button><button onClick={async () => { if (confirm('삭제할까요?')) { await deleteActivityPost(item.id); await refetch(); } }}>삭제</button></div>}</article>)}</div></section>{id && !selected && <p className="wrap not-found">해당 활동 기록을 찾지 못했습니다.</p>}{editing !== undefined && <ActivityEditor value={editing ?? undefined} close={() => setEditing(undefined)} />}</>;
}
