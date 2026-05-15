import { useMemo, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth';

interface Props {
  mode: 'signin' | 'signup';
  redirectTo?: string;
}

export function AuthForm({ mode, redirectTo }: Props) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const safeRedirect = useMemo(
    () =>
      redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : '/dashboard',
    [redirectTo]
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const fn = mode === 'signin' ? signIn : signUp;
      const { error, session } = await fn(email.trim(), password);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (mode === 'signup') {
        if (!session) {
          toast.success('Account created — confirm your email, then sign in.');
          window.location.assign(`/login?redirect=${encodeURIComponent(safeRedirect)}`);
          return;
        }
        toast.success('Account created.');
      } else if (!session) {
        toast.error('Login did not create a session. Please try again.');
        return;
      } else {
        toast.success('Welcome back.');
      }
      window.location.assign(safeRedirect);
    } finally {
      setBusy(false);
    }
  };

  const isSignup = mode === 'signup';

  const onOAuth = async (provider: 'google' | 'github') => {
    if (busy) return;
    setBusy(true);
    try {
      const { supabase } = await import('../../integrations/supabase/client');
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${safeRedirect}`,
        },
      });
      if (error) {
        toast.error(error.message);
        setBusy(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'OAuth failed');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-dark-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_24%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 min-h-dvh px-6 py-8 md:px-10 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:grid lg:grid-cols-[1.1fr_460px] lg:items-center">
          <section className="pt-2 lg:pt-0">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-gray-500 hover:text-white transition"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-dark-700 bg-dark-900/70">
                ←
              </span>
              Back to site
            </Link>

            <div className="mt-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-brand-300">
                AmzWP Automator
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl">
                {isSignup ? 'Build a cleaner publishing engine.' : 'Get back into your publishing command center.'}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-gray-400 md:text-lg">
                Plan, scan, verify, and ship Amazon-affiliate content through a workspace designed to feel dependable under pressure.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ['Cleaner scanning', 'Strict lookup budgeting'],
                  ['Faster reviews', 'High-signal product validation'],
                  ['Better publishing', 'Sharper output and safer flows'],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl border border-dark-800 bg-dark-900/60 p-4 backdrop-blur-sm">
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="rounded-[28px] border border-dark-800 bg-dark-900/85 p-7 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-300">
                  {isSignup ? 'Create access' : 'Secure sign in'}
                </p>
                <h2 className="mt-3 text-3xl font-black text-white">
                  {isSignup ? 'Create account' : 'Sign in'}
                </h2>
              </div>
              <div className="rounded-2xl border border-dark-700 bg-dark-950/80 px-3 py-2 text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Destination</p>
                <p className="mt-1 text-sm font-semibold text-white">{safeRedirect.replace('/dashboard', 'Dashboard') || 'Dashboard'}</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.24em] text-gray-400 font-bold">
                  Email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-dark-700 bg-dark-950/90 px-4 py-3.5 text-white placeholder-gray-600 transition focus:border-brand-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.24em] text-gray-400 font-bold">
                  Password
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-dark-700 bg-dark-950/90 px-4 py-3.5 text-white placeholder-gray-600 transition focus:border-brand-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-2xl bg-brand-500 py-3.5 text-base font-black text-white transition hover:bg-brand-400 disabled:opacity-50"
              >
                {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-gray-600">
              <span className="h-px flex-1 bg-dark-800" />
              or continue with
              <span className="h-px flex-1 bg-dark-800" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onOAuth('google')}
                disabled={busy}
                className="flex items-center justify-center gap-2 rounded-2xl border border-dark-700 bg-dark-950/80 py-3 text-sm font-bold text-white transition hover:bg-dark-800 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.15.8 3.87 1.49l2.64-2.54C16.85 3.3 14.66 2.3 12 2.3 6.9 2.3 2.8 6.4 2.8 11.5S6.9 20.7 12 20.7c6.93 0 9.2-4.87 9.2-7.4 0-.5-.05-.88-.13-1.1H12z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => onOAuth('github')}
                disabled={busy}
                className="flex items-center justify-center gap-2 rounded-2xl border border-dark-700 bg-dark-950/80 py-3 text-sm font-bold text-white transition hover:bg-dark-800 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-dark-800 bg-dark-950/60 px-4 py-3 text-sm text-gray-400">
              <span>Persistent sessions enabled with Supabase auth.</span>
              <span className="text-brand-300">● Live</span>
            </div>

            <p className="mt-6 text-sm text-gray-500 text-center">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <Link to="/login" search={{ redirect: safeRedirect }} className="text-brand-400 hover:text-brand-300 font-bold">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New here?{' '}
                  <Link to="/signup" search={{ redirect: safeRedirect }} className="text-brand-400 hover:text-brand-300 font-bold">
                    Create account
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
