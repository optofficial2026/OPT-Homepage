import optLogo from '../../opt-logo.png';
import { useSite } from './SiteContext';
import { sitePath } from '../lib/paths';

type NavigationProps = { active: 'home' | 'log' | 'archive' };

export default function Navigation({ active }: NavigationProps) {
  const { content } = useSite();
  const { settings } = content;
  return (
    <header className="nav">
      <nav>
        <a className="brand" href={sitePath('/')} aria-label="OPT 홈"><span className="brand-mark"><img src={optLogo} alt="" /></span></a>
        <div className="nav-links">
          <a className={active === 'home' ? 'active' : ''} href={sitePath('/')}>소개</a>
          <a className={active === 'log' ? 'active' : ''} href={sitePath('/log/')}>활동기록</a>
          <a className={active === 'archive' ? 'active' : ''} href={sitePath('/archive/')}>아카이브</a>
          {settings.recruitmentEnabled && <a className="button primary" href={sitePath('/#recruit')}>{settings.recruitmentCohort}기 지원</a>}
        </div>
      </nav>
    </header>
  );
}
