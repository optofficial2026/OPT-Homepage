import type { ActivityPost } from '../data/types';
import MediaGallery from '../components/MediaGallery';
import { sitePath } from '../lib/paths';

export default function ActivityDetailPage({ item }: { item: ActivityPost }) {
  return <main className="detail-page"><header className="detail-hero"><div className="wrap"><a className="back mono" href={sitePath('/log/')}>← 활동 기록</a><p className="mono cyan">{item.tag} · {item.cohort}기 · {item.occurredOn}</p><h1>{item.title}</h1><p>{item.summary}</p></div></header>
    <article className="wrap detail-content">{item.heroImageUrl && <img className="detail-cover" src={item.heroImageUrl} alt="" />}<section><h2>활동 내용</h2><p className="pre-line">{item.body}</p></section><MediaGallery urls={item.galleryUrls} alt={item.title} /></article>
  </main>;
}
