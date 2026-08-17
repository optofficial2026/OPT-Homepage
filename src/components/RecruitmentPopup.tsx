import { useEffect, useState } from 'react';
import type { SiteSettings } from '../data/types';

export default function RecruitmentPopup({ settings, contentLoading }: { settings: SiteSettings; contentLoading: boolean }) {
  const [open, setOpen] = useState(false);
  const recruitmentAvailable = settings.recruitmentEnabled && settings.recruitmentPopupEnabled;

  useEffect(() => {
    if (contentLoading || !recruitmentAvailable) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [contentLoading, recruitmentAvailable]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!open) return null;
  return <div className="modal" role="dialog" aria-modal="true" aria-labelledby="recruitment-popup-title" onClick={() => setOpen(false)}>
    <div className="modal-box" onClick={(event) => event.stopPropagation()}>
      <button className="modal-x" type="button" aria-label="모집 팝업 닫기" onClick={() => setOpen(false)}>×</button>
      <p>JOIN OPT · {settings.recruitmentCohort}TH</p>
      <h1 id="recruitment-popup-title">AI를 공부하고 싶은데 막막한 당신!</h1>
      <div>OPT (Optimizer)는 당신이 목표를 향한 첫발을 내딛도록 함께할 준비가 되어 있습니다.</div>
      <div className="modal-actions recruitment-popup-cta">
        {settings.recruitmentFormUrl ? <a className="button dark" href={settings.recruitmentFormUrl} target="_blank" rel="noreferrer">지원하기</a> : <button className="button dark" type="button" disabled>지원하기</button>}
      </div>
    </div>
  </div>;
}
