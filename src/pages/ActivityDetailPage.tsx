import type { ActivityPost } from '../data/types';
import DetailSection from '../components/DetailSection';
import MediaGallery from '../components/MediaGallery';
import { sitePath } from '../lib/paths';
import { displayDate } from '../data/content';

export default function ActivityDetailPage({ item }: { item: ActivityPost }) {
  return <main className="detail-page">
    <header className="detail-hero"><div className="wrap">
      <a className="back mono" href={sitePath('/log/')}>← 활동 기록</a>
      <p className="mono cyan">{item.tag} · {item.cohort}기 · {displayDate(item.occurredOn)}</p>
      <h1>{item.title}</h1>
      <p>{item.summary}</p>
    </div></header>
    <article className="wrap detail-content">
      {item.heroImageUrl
        ? <img className="detail-cover" src={item.heroImageUrl} alt={`${item.title} 대표 이미지`} />
        : <div className="detail-cover placeholder">대표 이미지 준비 중입니다.</div>}
      <DetailSection eyebrow="01 / CONTENT" title="활동 내용" empty={!item.body.trim()}>
        <p className="pre-line">{item.body}</p>
      </DetailSection>
      <DetailSection eyebrow="02 / GALLERY" title="활동 사진" empty={item.galleryUrls.length === 0}>
        <MediaGallery urls={item.galleryUrls} alt={item.title} />
      </DetailSection>
    </article>
  </main>;
}
