import { useState } from 'react';
import { useSite } from './SiteContext';

// Without this the site falls back to cached or bundled sample content in silence,
// so a stale page looks exactly like a healthy one.
export default function ContentStatusBanner() {
  const { contentError, contentSource, refetch } = useSite();
  const [retrying, setRetrying] = useState(false);
  if (!contentError) return null;

  const message = contentSource === 'cache'
    ? '최신 내용을 불러오지 못해 이전에 저장된 화면을 보여주고 있습니다.'
    : '최신 내용을 불러오지 못해 기본 예시가 표시되고 있습니다. 실제 활동 내용과 다를 수 있습니다.';

  return <div className="content-status" role="status">
    <div className="wrap">
      <strong>연결 문제</strong>
      <span>{message}</span>
      <button type="button" disabled={retrying} onClick={async () => {
        setRetrying(true);
        try { await refetch(); } finally { setRetrying(false); }
      }}>{retrying ? '다시 시도 중…' : '다시 시도'}</button>
    </div>
  </div>;
}
