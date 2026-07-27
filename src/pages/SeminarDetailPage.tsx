import type { ArchiveItem, SeminarDetail } from '../data/types';
import MediaGallery from '../components/MediaGallery';

export default function SeminarDetailPage({ item }: { item: ArchiveItem }) {
  const detail = item.detail as SeminarDetail;
  return <main className="detail-page"><header className="detail-hero"><div className="wrap"><a className="back mono" href="/archive/">← 아카이브</a><p className="mono cyan">SEMINAR · {item.cohort}기 · {item.occurredOn}</p><h1>{item.title}</h1><p>{item.summary}</p></div></header><article className="wrap detail-content">{detail.heroImageUrl && <img className="detail-cover" src={detail.heroImageUrl} alt="" />}<section><h2>세미나 내용</h2><p className="pre-line">{detail.body}</p></section><MediaGallery urls={detail.galleryUrls} alt={item.title} />{detail.resourceUrl && <a className="button primary" href={detail.resourceUrl} target="_blank" rel="noreferrer">자료 보기 ↗</a>}</article></main>;
}
