import { useEffect, useRef, useState } from 'react';
import { sortTimelineNewestFirst } from '../data/content';
import optLogo from '../../opt 로고 거북이 화이트 모드.png';
import { SettingsEditor, TimelineEditor } from '../components/HomeEditors';
import RecruitmentPopup from '../components/RecruitmentPopup';
import { useSite } from '../components/SiteContext';
import { deleteTimelineItem } from '../lib/content-mutations';
import { sitePath } from '../lib/paths';
import type { TimelineItem } from '../data/types';

const values = [
  ['01', '이론부터 제대로', '논문과 기초 이론을 함께 읽고 소화합니다.'],
  ['02', '발표하며 토론', '발표자는 주제를 깊이 있게 숙지하고, 모두 함께 다양한 지식과 관점을 익힙니다.'],
  ['03', '피드백으로 성장', '발표 뒤 질문과 피드백을 주고받으며 성장합니다.'],
];
// 마지막 값은 활동 기록에서 미리 걸어둘 필터. 비어 있으면 링크를 걸지 않는다.
const activities = [
  ['🎙', 'SEMINAR', '세미나', '각자 공부한 주제를 발표하고 토론하는 자리. 가르치며 배우고, 질문하며 다시 배웁니다.', 'SEMINAR'],
  ['📖', 'STUDY', '스터디', 'AI 기초 이론과 논문을 함께 읽는 정기 스터디. 매주 한 챕터씩 개념을 쌓아 올립니다.', 'STUDY'],
  ['</>', 'HACKATHON', '해커톤', '배운 이론을 활용해도, 자유 주제를 골라도 됩니다. 주제는 당일 공개됩니다.', ''],
];

export default function HomePage() {
  const { content, contentLoading, isEditMode, refetch } = useSite();
  const { settings } = content;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timelineEdit, setTimelineEdit] = useState<TimelineItem | null | undefined>(undefined);
  const timelineRef = useRef<HTMLDivElement>(null);
  const sortedTimeline = sortTimelineNewestFirst(content.timeline);
  useEffect(() => {
    const reveal = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => reveal.observe(element));
    return () => { reveal.disconnect(); };
  }, [content.timeline]);
  useEffect(() => { if (timelineRef.current) timelineRef.current.scrollTop = 0; }, [content.timeline]);

  return <>
    <section className="hero" id="top"><div className="hero-grid" /><div className="hero-blob lime" /><div className="hero-blob cyan" /><div className="wrap hero-content">{settings.recruitmentEnabled && <div className="recruit-badge"><i />{settings.recruitmentCohort}기 부원 모집 중</div>}<div className="hero-logo"><img src={optLogo} alt="OPT 로고" /></div><p className="mono cyan">// AI ACADEMIC CLUB</p><h1><span className="reveal">Slow &amp; steady</span><span className="reveal">Think deep</span><em className="reveal">OPT</em></h1><p className="hero-body reveal">시행착오를 거치며 우리의 문제를 최적화해 나갑니다. 대학생, 현직자, 연구원이 함께 모여 치열하게 부딪히고 성장하는 곳, <b>OPT</b> 입니다.</p><div className="hero-actions reveal"><a className="button primary" href="#about">동아리 살펴보기 →</a><a className="button outline" href="#activities">핵심 활동 보기</a>{isEditMode && <button className="admin-action" type="button" onClick={() => setSettingsOpen(true)}>홈 정보 수정</button>}</div></div></section>
    <div className="marquee"><div>STUDY <b>·</b> SEMINAR <b>·</b> HACKATHON <b>·</b> PAPER READING <b>·</b> DISCUSSION <b>·</b> ARCHIVE <b>·</b> STUDY <b>·</b> SEMINAR <b>·</b> HACKATHON <b>·</b></div></div>
    <section className="wrap section about" id="about"><div className="about-copy reveal"><p className="mono cyan">01 / ABOUT</p><h2>스스로 탐구하고,<br />나누는 동아리</h2><div>OPT에서는 단순히 내용을 받아들이는 데 그치지 않습니다. 각자 맡은 주제를 직접 조사해 세미나에서 설명하고, 질문과 피드백을 주고받으며 서로의 이해를 넓힙니다. 배우고, 정리하고, 남에게 전달하는 과정을 반복합니다.</div></div><div className="value-list">{values.map(([number, title, body]) => <article className="reveal" key={number}><b>{number}</b><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>
    <section className="wrap section" id="activities"><p className="mono cyan reveal">02 / WHAT WE DO</p><h2 className="reveal">핵심 활동</h2><div className="activity-cards">{activities.map(([icon, label, title, body, tag]) => {
      const card = <><div className="icon">{icon}</div><p className="mono cyan">{label}</p><h3>{title}</h3><div className="activity-card-body">{body}</div>{tag && <span className="activity-card-more">활동 기록 보기 →</span>}</>;
      return <article className="reveal" key={label}>{tag ? <a href={`${sitePath('/log/')}?tag=${tag}`}>{card}</a> : card}</article>;
    })}</div></section>
    <section className="history"><div className="wrap section"><p className="mono cyan reveal">03 / HISTORY</p><div className="section-heading"><h2 className="reveal">활동 내용</h2>{isEditMode && <button className="admin-action" type="button" onClick={() => setTimelineEdit(null)}>활동 내용 추가</button>}</div><div className="timeline timeline-scroll" ref={timelineRef}>{sortedTimeline.map((item) => <article className="timeline-item reveal" key={item.id}><i className="timeline-dot" /><p>{item.occurredOn}</p><h3>{item.title}</h3><div>{item.description}</div>{isEditMode && <div className="inline-actions"><button type="button" onClick={() => setTimelineEdit(item)}>수정</button><button type="button" onClick={async () => { if (confirm('이 활동 내용을 삭제할까요?')) { await deleteTimelineItem(item.id); await refetch(); } }}>삭제</button></div>}</article>)}</div></div></section>
    <RecruitmentPopup settings={settings} contentLoading={contentLoading} />
    {settingsOpen && <SettingsEditor value={settings} close={() => setSettingsOpen(false)} />}
    {timelineEdit !== undefined && <TimelineEditor value={timelineEdit ?? undefined} close={() => setTimelineEdit(undefined)} />}
  </>;
}
