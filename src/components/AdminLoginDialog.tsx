import { useState, type FormEvent } from 'react';
import { useSite } from './SiteContext';

export default function AdminLoginDialog() {
  const { loginOpen, setLoginOpen, signIn, authError } = useSite();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  if (!loginOpen) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await signIn(email, password);
  };

  return <dialog className="admin-dialog" open aria-labelledby="admin-login-title">
    <form onSubmit={submit}>
      <button className="dialog-close" type="button" onClick={() => setLoginOpen(false)} aria-label="닫기">×</button>
      <p className="mono cyan">ADMIN</p>
      <h2 id="admin-login-title">관리자 로그인</h2>
      <label>이메일<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>비밀번호<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {authError && <p className="form-error">{authError}</p>}
      <button className="button primary" type="submit">로그인</button>
    </form>
  </dialog>;
}
