import type { ReactNode } from 'react';

export default function DetailSection({ eyebrow, title, empty = false, children }: {
  eyebrow: string;
  title: string;
  empty?: boolean;
  children?: ReactNode;
}) {
  return <section className="detail-section">
    <p className="mono cyan">{eyebrow}</p>
    <h2>{title}</h2>
    <div className="detail-section-body">
      {empty ? <p className="detail-empty">준비 중입니다.</p> : children}
    </div>
  </section>;
}
