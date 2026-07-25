import { useEffect } from 'react';
import { timeline } from '../data/content';
import optLogo from '../../opt-logo.png';

const values = [
  ['01', '이론부터 제대로', '논문과 기초 이론을 함께 읽고 소화합니다.'],
  ['02', '발표하며 토론', '발표자는 주제를 깊이 있게 숙지하고, 수강자는 다양한 지식과 관점을 함께 익힙니다.'],
  ['03', '피드백으로 성장', '발표 뒤 질문과 피드백을 주고받으며 생각을 더 정확하게 다듬습니다.'],
];
const activities = [
  ['📖', 'STUDY', '스터디', 'AI 기초 이론과 논문을 함께 읽는 정기 스터디. 매주 한 챕터씩 개념을 쌓아 올립니다.'],
  ['🎙', 'SEMINAR', '세미나', '각자 공부한 주제를 발표하고 토론하는 자리. 가르치며 배우고, 질문하며 다시 배웁니다.'],
  ['</>', 'HACKATHON', '해커톤', '배운 이론을 활용해도, 자유 주제를 골라도 됩니다. 주제는 당일 공개됩니다.'],
];

export default function HomePage() {
  useEffect(() => {
    const reveal = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => reveal.observe(element));
    const counter = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const element = entry.target as HTMLElement;
      const target = Number(element.dataset.count ?? 0); const start = performance.now();
      const tick = (now: number) => { const progress = Math.min(1, (now - start) / 900); element.textContent = String(Math.round(target * (1 - (1 - progress) ** 3))); if (progress < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.5 });
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => counter.observe(element));
    return () => { reveal.disconnect(); counter.disconnect(); };
  }, []);

  return <>
    <section className="hero" id="top"><div className="hero-grid" /><div className="hero-blob lime" /><div className="hero-blob cyan" /><div className="wrap hero-content"><div className="recruit-badge"><i />2기 부원 모집 중</div><div className="hero-logo"><img src={optLogo} alt="OPT 로고" /></div><p className="mono cyan">// AI ACADEMIC CLUB</p><h1><span className="reveal">AI를 배우고,</span><span className="reveal">토론하고,</span><em className="reveal">깨우친다.</em></h1><p className="hero-body reveal">스터디에서 <b>기술과 논문</b>의 기반을 다지고, 세미나에서는 직접 탐구한 주제를 발표하며 부원들과 질문과 토의를 나눕니다. 수동적으로 듣는 대신, <b>주도적으로 AI 이론</b>을 이해하고 설명하는 힘을 기릅니다.</p><div className="hero-actions reveal"><a className="button primary" href="#about">동아리 살펴보기 →</a><a className="button outline" href="#activities">핵심 활동 보기</a></div><div className="stats reveal">{[[1, '기', '함께한 활동 기수'], [4, '+', '누적 세미나·발표'], [11, '+', '함께한 멤버']].map(([count, suffix, label]) => <div key={String(label)}><strong data-count={count}>0</strong><em>{suffix}</em><span>{label}</span></div>)}</div></div></section>
    <div className="marquee"><div>STUDY <b>·</b> SEMINAR <b>·</b> HACKATHON <b>·</b> PAPER READING <b>·</b> DISCUSSION <b>·</b> ARCHIVE <b>·</b> STUDY <b>·</b> SEMINAR <b>·</b> HACKATHON <b>·</b></div></div>
    <section className="wrap section about" id="about"><div className="about-copy reveal"><p className="mono cyan">01 / ABOUT</p><h2>스스로 탐구하고,<br />나누는 동아리</h2><div>OPT에서는 단순히 내용을 받아들이는 데 그치지 않습니다. 각자 맡은 주제를 직접 조사해 세미나에서 설명하고, 질문과 피드백을 주고받으며 서로의 이해를 넓힙니다. 배우고, 정리하고, 남에게 전달하는 과정을 반복합니다.</div></div><div className="value-list">{values.map(([number, title, body]) => <article className="reveal" key={number}><b>{number}</b><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>
    <section className="wrap section" id="activities"><p className="mono cyan reveal">02 / WHAT WE DO</p><h2 className="reveal">핵심 활동</h2><div className="activity-cards">{activities.map(([icon, label, title, body]) => <article className="reveal" key={label}><div className="icon">{icon}</div><p className="mono cyan">{label}</p><h3>{title}</h3><div>{body}</div></article>)}</div></section>
    <section className="history"><div className="wrap section"><p className="mono cyan reveal">03 / HISTORY</p><h2 className="reveal">활동 연혁</h2><div className="timeline">{timeline.map((item) => <article className="timeline-item reveal" key={item.date}><i className="timeline-dot" /><p>{item.date}</p><h3>{item.title}</h3><div>{item.body}</div></article>)}</div></div></section>
    <section className="wrap section" id="recruit"><div className="recruit-banner reveal"><div><p className="recruit-badge dark-badge"><i />JOIN OPT · 2ND</p><h2>AI를 공부하고 친숙해지고 싶지만 막막한 당신!</h2><div>OPT (Optimal Personal Teacher)는 당신이 목표를 향한 첫발을 내딛도록 함께할 준비가 되어 있습니다.</div><button className="button dark" type="button" disabled>지원하기</button></div></div></section>
  </>;
}
