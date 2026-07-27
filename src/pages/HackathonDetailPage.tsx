import type { ArchiveItem, HackathonDetail } from '../data/types';
import DetailSection from '../components/DetailSection';
import MediaGallery from '../components/MediaGallery';
import { sitePath } from '../lib/paths';
import { displayDate } from '../data/content';

export default function HackathonDetailPage({ item }: { item: ArchiveItem }) {
  const detail = item.detail as HackathonDetail;
  const links = [['GitHub', detail.githubUrl], ['라이브 데모', detail.demoUrl], ['발표 자료', detail.presentationUrl]].filter((entry) => entry[1]);

  return <main className="detail-page hack-detail">
    <header className="hack-detail-hero"><div className="hero-grid" /><div className="wrap">
      <a className="back mono" href={sitePath('/archive/')}>← HACKATHON ARCHIVE</a>
      <div className="hack-meta"><b>HACKATHON</b><span>{item.cohort}기</span><span>{displayDate(item.occurredOn)}</span>{detail.award && <strong>{detail.award}</strong>}</div>
      <h1>{item.title}</h1>
      <p>{detail.tagline || item.summary}</p>
    </div></header>
    <article className="wrap detail-content">
      {detail.heroImageUrl
        ? <img className="detail-cover" src={detail.heroImageUrl} alt={`${item.title} 대표 화면`} />
        : <div className="detail-cover placeholder">대표 이미지 준비 중입니다.</div>}

      <div className="detail-two-col">
        <DetailSection eyebrow="01 / PROBLEM" title="문제" empty={!detail.problem.trim()}>
          <p className="pre-line">{detail.problem}</p>
        </DetailSection>
        <DetailSection eyebrow="02 / SOLUTION" title="해결" empty={!detail.solution.trim()}>
          <p className="pre-line">{detail.solution}</p>
        </DetailSection>
      </div>

      <DetailSection eyebrow="03 / FEATURES" title="주요 기능" empty={detail.features.length === 0}>
        <div className="feature-grid">{detail.features.map((feature, index) =>
          <article key={feature}><b>{String(index + 1).padStart(2, '0')}</b><p>{feature}</p></article>
        )}</div>
      </DetailSection>

      <DetailSection eyebrow="04 / SCREENS" title="프로젝트 화면" empty={detail.galleryUrls.length === 0}>
        <MediaGallery urls={detail.galleryUrls} alt={item.title} />
      </DetailSection>

      <DetailSection eyebrow="05 / PROCESS" title="개발 과정" empty={detail.process.length === 0}>
        <ol className="process-list">{detail.process.map((step) => <li key={step}>{step}</li>)}</ol>
      </DetailSection>

      <DetailSection eyebrow="06 / ARCHITECTURE" title="시스템 구조" empty={!detail.architecture.trim()}>
        <div className="architecture-card"><span>CLIENT</span><i>→</i><span>API</span><i>→</i><span>AI / DATA</span></div>
        <p className="pre-line">{detail.architecture}</p>
      </DetailSection>

      <DetailSection eyebrow="07 / RETROSPECTIVE" title="회고" empty={!detail.retrospective.trim()}>
        <p className="pre-line">{detail.retrospective}</p>
      </DetailSection>

      <DetailSection eyebrow="08 / RESULT" title="결과" empty={!detail.award.trim() && !detail.result.trim()}>
        <div className="result-card">{detail.award && <strong>{detail.award}</strong>}{detail.result && <p className="pre-line">{detail.result}</p>}</div>
      </DetailSection>

      <div className="detail-two-col">
        <DetailSection eyebrow="09 / STACK" title="기술 스택" empty={detail.techStack.length === 0}>
          <div className="tech-list">{detail.techStack.map((tech) => <i key={tech}>{tech}</i>)}</div>
        </DetailSection>
        <DetailSection eyebrow="10 / TEAM" title="팀" empty={!detail.teamName.trim() && detail.teamMembers.length === 0}>
          {detail.teamName && <h3>{detail.teamName}</h3>}
          {detail.teamMembers.length > 0 && <ul>{detail.teamMembers.map((member) => <li key={member}>{member}</li>)}</ul>}
        </DetailSection>
      </div>

      <nav className="detail-links">
        {links.length > 0
          ? links.map(([label, url]) => <a className="button primary" href={url} target="_blank" rel="noreferrer" key={label}>{label} ↗</a>)
          : <p className="detail-empty">준비 중입니다.</p>}
      </nav>
    </article>
  </main>;
}
