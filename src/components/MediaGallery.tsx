export default function MediaGallery({ urls, alt }: { urls: string[]; alt: string }) {
  if (!urls.length) return null;
  return <div className="detail-gallery">{urls.map((url, index) => <img src={url} alt={`${alt} ${index + 1}`} loading="lazy" key={url} />)}</div>;
}
