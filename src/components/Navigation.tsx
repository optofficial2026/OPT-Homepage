import optLogo from '../../opt 로고 거북이 다크모드.png';
import { useSite } from './SiteContext';
import { sitePath } from '../lib/paths';

type NavigationProps = { active: 'home' | 'intro' | 'log' | 'archive' };

export default function Navigation({ active }: NavigationProps) {
  const { content } = useSite();
  const { settings } = content;
  return (
    <header className="nav">
      <nav>
        <a className="brand" href={sitePath('/')} aria-label="OPT 홈"><span className="brand-mark"><img src={optLogo} alt="" /></span></a>
        <div className="nav-links">
          <a className={active === 'home' ? 'active' : ''} href={sitePath('/')}>홈</a>
          <a className={active === 'intro' ? 'active' : ''} href={sitePath('/intro/')}>소개</a>
          <a className={active === 'log' ? 'active' : ''} href={sitePath('/log/')}>활동기록</a>
          <a className={active === 'archive' ? 'active' : ''} href={sitePath('/archive/')}>아카이브</a>
          {settings.recruitmentEnabled && (settings.recruitmentFormUrl
            ? <a className="button primary recruitment-cta" href={settings.recruitmentFormUrl} target="_blank" rel="noreferrer">{settings.recruitmentCohort}기 지원</a>
            : <button className="button primary recruitment-cta" type="button" disabled>{settings.recruitmentCohort}기 지원</button>)}
        </div>
      </nav>
    </header>
  );
}
