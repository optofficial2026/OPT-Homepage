import { useSite } from './SiteContext';

export default function AdminToolbar() {
  const { isAdmin, isEditMode, setEditMode, signOut } = useSite();
  if (!isAdmin) return null;
  return <aside className="admin-toolbar" aria-label="관리자 도구">
    <button type="button" onClick={() => setEditMode(!isEditMode)}>{isEditMode ? '편집 종료' : '편집 시작'}</button>
    <button type="button" onClick={() => void signOut()}>로그아웃</button>
  </aside>;
}
