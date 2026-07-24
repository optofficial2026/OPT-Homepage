import Navigation from './components/Navigation';
import ArchivePage from './pages/ArchivePage';
import HomePage from './pages/HomePage';
import LogPage from './pages/LogPage';

type Page = 'home' | 'log' | 'archive';
type AppProps = { page: string };

const pageContent = { home: HomePage, log: LogPage, archive: ArchivePage } satisfies Record<Page, typeof HomePage>;

export default function App({ page }: AppProps) {
  const current = (page in pageContent ? page : 'home') as Page;
  const PageContent = pageContent[current];
  return <div className="min-h-screen">{current === 'home' && <div className="ticker"><div>NOW RECRUITING　★　2기 부원 모집 중　★　STUDY · SEMINAR · HACKATHON　★　JOIN OPT　★　NOW RECRUITING　★　2기 부원 모집 중　★　STUDY · SEMINAR · HACKATHON　★</div></div>}<Navigation active={current} /><PageContent /><footer><div className="wrap"><div className="brand"><i />OPT <span>AI Academic Club</span></div><div className="mono">활동 기록은 계속 업데이트됩니다.</div></div></footer></div>;
}
