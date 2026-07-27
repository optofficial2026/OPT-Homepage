import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { SiteContent } from '../data/types';
import { useSiteContent } from '../hooks/useSiteContent';
import { supabase } from '../lib/supabase';

type SiteContextValue = {
  content: SiteContent;
  refetch: () => Promise<void>;
  contentError: string;
  isAdmin: boolean;
  isEditMode: boolean;
  setEditMode: (value: boolean) => void;
  loginOpen: boolean;
  setLoginOpen: (value: boolean) => void;
  authError: string;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const Context = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const { data: content, error: contentError, refetch } = useSiteContent();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const verify = async (nextUser: User | null) => {
      setUser(nextUser);
      if (!nextUser) { setIsAdmin(false); setEditMode(false); return; }
      const { data } = await client.from('admin_profiles').select('user_id').eq('user_id', nextUser.id).maybeSingle();
      const nextIsAdmin = Boolean(data);
      setIsAdmin(nextIsAdmin);
      if (!nextIsAdmin) setEditMode(false);
    };
    void client.auth.getUser().then(({ data }) => verify(data.user));
    const { data } = client.auth.onAuthStateChange((_event, session) => { void verify(session?.user ?? null); });
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError('');
    if (!supabase) { setAuthError('Supabase 연결 후 관리자 로그인을 사용할 수 있습니다.'); return false; }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); return false; }
    const { data: profile } = await supabase.from('admin_profiles').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (!profile) {
      await supabase.auth.signOut();
      setIsAdmin(false);
      setEditMode(false);
      setAuthError('관리자 권한이 없는 계정입니다.');
      return false;
    }
    setUser(data.user);
    setIsAdmin(true);
    setLoginOpen(false);
    return true;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setEditMode(false);
  };

  const value = useMemo(() => ({
    content, refetch, contentError, isAdmin, isEditMode, setEditMode,
    loginOpen, setLoginOpen, authError, signIn, signOut,
  }), [content, contentError, isAdmin, isEditMode, loginOpen, authError, refetch]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSite() {
  const value = useContext(Context);
  if (!value) throw new Error('useSite must be used inside SiteProvider');
  return value;
}
