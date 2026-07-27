import { MAX_GALLERY_IMAGES } from '../lib/media-storage';

export default function MediaGallery({ urls, alt }: { urls: string[]; alt: string }) {
  const visibleUrls = urls.slice(0, MAX_GALLERY_IMAGES);
  if (!visibleUrls.length) return null;
  return <div className="detail-gallery">{visibleUrls.map((url, index) => <img src={url} alt={`${alt} ${index + 1}`} loading="lazy" key={url} />)}</div>;
}
