import Navigation from './components/Navigation';
import AdminLoginDialog from './components/AdminLoginDialog';
import AdminToolbar from './components/AdminToolbar';
import { SiteProvider, useSite } from './components/SiteContext';
import ArchivePage from './pages/ArchivePage';
import HomePage from './pages/HomePage';
import LogPage from './pages/LogPage';

type Page = 'home' | 'log' | 'archive';
type AppProps = { page: string };

const pageContent = { home: HomePage, log: LogPage, archive: ArchivePage } satisfies Record<Page, typeof HomePage>;

function Site({ page }: AppProps) {
  const current = (page in pageContent ? page : 'home') as Page;
  const PageContent = pageContent[current];
  const { content, isAdmin, setLoginOpen } = useSite();
  const { settings } = content;
  return <div className="min-h-screen">{current === 'home' && settings.recruitmentEnabled && <div className="ticker"><div>NOW RECRUITING　★　{settings.recruitmentCohort}기 부원 모집 중　★　STUDY · SEMINAR · HACKATHON　★　JOIN OPT　★　NOW RECRUITING　★　{settings.recruitmentCohort}기 부원 모집 중　★</div></div>}<Navigation active={current} /><PageContent /><footer><div className="wrap"><div className="brand"><i />OPT <span>AI Academic Club</span></div><div className="footer-admin"><span className="mono">활동 기록은 계속 업데이트됩니다.</span>{!isAdmin && <button type="button" onClick={() => setLoginOpen(true)}>관리자 로그인</button>}</div></div></footer><AdminLoginDialog /><AdminToolbar /></div>;
}

export default function App(props: AppProps) {
  return <SiteProvider><Site {...props} /></SiteProvider>;
}
