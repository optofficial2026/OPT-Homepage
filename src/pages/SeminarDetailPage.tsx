import type { ArchiveItem, SeminarDetail } from '../data/types';
import DetailSection from '../components/DetailSection';
import MediaGallery from '../components/MediaGallery';
import { sitePath } from '../lib/paths';
import { displayDate } from '../data/content';

export default function SeminarDetailPage({ item }: { item: ArchiveItem }) {
  const detail = item.detail as SeminarDetail;
  return <main className="detail-page">
    <header className="detail-hero"><div className="wrap">
      <a className="back mono" href={sitePath('/archive/')}>← 아카이브</a>
      <p className="mono cyan">SEMINAR · {item.cohort}기 · {displayDate(item.occurredOn)}</p>
      <h1>{item.title}</h1>
      <p>{item.summary}</p>
    </div></header>
    <article className="wrap detail-content">
      {detail.heroImageUrl
        ? <img className="detail-cover" src={detail.heroImageUrl} alt={`${item.title} 대표 이미지`} />
        : <div className="detail-cover placeholder">대표 이미지 준비 중입니다.</div>}
      <DetailSection eyebrow="01 / CONTENT" title="세미나 내용" empty={!detail.body.trim()}>
        <p className="pre-line">{detail.body}</p>
      </DetailSection>
      <DetailSection eyebrow="02 / GALLERY" title="세미나 사진" empty={detail.galleryUrls.length === 0}>
        <MediaGallery urls={detail.galleryUrls} alt={item.title} />
      </DetailSection>
      <DetailSection eyebrow="03 / RESOURCE" title="관련 자료" empty={!detail.resourceUrl}>
        <a className="button primary" href={detail.resourceUrl} target="_blank" rel="noreferrer">자료 보기 ↗</a>
      </DetailSection>
    </article>
  </main>;
}
