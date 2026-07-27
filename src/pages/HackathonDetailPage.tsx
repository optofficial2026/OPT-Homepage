import type { ArchiveItem, HackathonDetail } from '../data/types';
import MediaGallery from '../components/MediaGallery';

const Section = ({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) =>
  <section className="hack-detail-section"><p className="mono cyan">{eyebrow}</p><h2>{title}</h2>{children}</section>;

export default function HackathonDetailPage({ item }: { item: ArchiveItem }) {
  const detail = item.detail as HackathonDetail;
  const links = [['GitHub', detail.githubUrl], ['라이브 데모', detail.demoUrl], ['발표 자료', detail.presentationUrl]].filter((entry) => entry[1]);
  return <main className="detail-page hack-detail"><header className="hack-detail-hero"><div className="hero-grid" /><div className="wrap"><a className="back mono" href="/archive/">← HACKATHON ARCHIVE</a><div className="hack-meta"><b>HACKATHON</b><span>{item.cohort}기</span><span>{item.occurredOn}</span>{detail.award && <strong>{detail.award}</strong>}</div><h1>{item.title}</h1><p>{detail.tagline || item.summary}</p></div></header>
    <article className="wrap detail-content">{detail.heroImageUrl ? <img className="detail-cover" src={detail.heroImageUrl} alt={`${item.title} 대표 화면`} /> : <div className="detail-cover placeholder">PROJECT HERO IMAGE</div>}
      <div className="detail-two-col"><Section eyebrow="01 / PROBLEM" title="문제"><p className="pre-line">{detail.problem || '문제 정의를 입력해주세요.'}</p></Section><Section eyebrow="02 / SOLUTION" title="해결"><p className="pre-line">{detail.solution || '해결 방법을 입력해주세요.'}</p></Section></div>
      <Section eyebrow="03 / FEATURES" title="주요 기능"><div className="feature-grid">{detail.features.map((feature, index) => <article key={feature}><b>{String(index + 1).padStart(2, '0')}</b><p>{feature}</p></article>)}</div></Section>
      <Section eyebrow="04 / SCREENS" title="프로젝트 화면"><MediaGallery urls={detail.galleryUrls} alt={item.title} /></Section>
      <Section eyebrow="05 / PROCESS" title="개발 과정"><ol className="process-list">{detail.process.map((step) => <li key={step}>{step}</li>)}</ol></Section>
      <Section eyebrow="06 / ARCHITECTURE" title="시스템 구조"><div className="architecture-card"><span>CLIENT</span><i>→</i><span>API</span><i>→</i><span>AI / DATA</span></div><p className="pre-line">{detail.architecture}</p></Section>
      <Section eyebrow="07 / RETROSPECTIVE" title="회고"><p className="pre-line">{detail.retrospective}</p></Section>
      <Section eyebrow="08 / RESULT" title="결과"><div className="result-card"><strong>{detail.award || '해커톤 결과'}</strong><p className="pre-line">{detail.result}</p></div></Section>
      <div className="detail-two-col"><Section eyebrow="09 / STACK" title="기술 스택"><div className="tech-list">{detail.techStack.map((tech) => <i key={tech}>{tech}</i>)}</div></Section><Section eyebrow="10 / TEAM" title="팀"><h3>{detail.teamName}</h3><ul>{detail.teamMembers.map((member) => <li key={member}>{member}</li>)}</ul></Section></div>
      {links.length > 0 && <nav className="detail-links">{links.map(([label, url]) => <a className="button primary" href={url} target="_blank" rel="noreferrer" key={label}>{label} ↗</a>)}</nav>}
    </article></main>;
}
