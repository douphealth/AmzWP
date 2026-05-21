import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; session: Session | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; session: Session | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
  };

  useEffect(() => {
    // CRITICAL: subscribe FIRST, then load existing session.
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, s: Session | null) => {
        syncSession(s);
        setLoading(false);
      }
    );

    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        syncSession(data.session);
      })
      .catch((error) => {
        console.error(error);
        syncSession(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.session) syncSession(data.session);
    return { error, session: data.session ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
      },
    });
    if (data.session) syncSession(data.session);
    return { error, session: data.session ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    syncSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
