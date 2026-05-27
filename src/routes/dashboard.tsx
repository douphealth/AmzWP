import {
  createFileRoute,
  Outlet,
  useLocation,
  useRouter,
  Link,
} from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../lib/auth';

export const Route = createFileRoute('/dashboard')({
  component: DashboardChrome,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-dvh bg-paper flex items-center justify-center p-8">
      <div className="card-edit p-8 max-w-lg text-center">
        <h1 className="font-display text-2xl font-bold text-ink mb-3">Something broke</h1>
        <p className="text-ink-3 text-sm mb-6">{error.message}</p>
        <button onClick={reset} className="btn-primary">Try again</button>
      </div>
    </div>
  ),
});

type NavItem = {
  to: '/dashboard' | '/dashboard/sites' | '/dashboard/generator';
  label: string;
  hint: string;
  exact?: boolean;
  icon: ReactNode;
};

const NAV: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Overview',
    hint: 'Your snapshot',
    exact: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l9-9 9 9" /><path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    to: '/dashboard/sites',
    label: 'Sites',
    hint: 'WordPress connections',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
      </svg>
    ),
  },
  {
    to: '/dashboard/generator',
    label: 'Generator',
    hint: 'Scan & build posts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

function DashboardChrome() {
  const { user, signOut, loading, session } = useAuth();
  const router = useRouter();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const redirectTarget = `${location.pathname}${location.searchStr}`;

  useEffect(() => {
    if (!loading) {
      setAuthTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAuthTimedOut(true);
      router.navigate({ to: '/login', search: { redirect: redirectTarget } });
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [loading, redirectTarget, router]);

  useEffect(() => {
    if (!loading && !session) {
      router.navigate({ to: '/login', search: { redirect: redirectTarget } });
    }
  }, [loading, redirectTarget, router, session]);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.state.location.pathname]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-paper flex items-center justify-center">
        <div className="flex items-center gap-3 text-ink-3">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">{authTimedOut ? 'Redirecting to sign in…' : 'Loading dashboard…'}</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: '/login', search: { redirect: redirectTarget } });
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  const sidebar = (
    <aside className="h-full w-72 shrink-0 bg-white border-r border-rule flex flex-col">
      <div className="px-6 pt-7 pb-6 border-b border-rule">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center shadow-[0_8px_20px_-10px_rgba(15,23,42,.6)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-ink tracking-tight">AmzWP</div>
            <div className="eyebrow text-[10px] text-ink-4">Affiliate studio</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="eyebrow px-3 pb-3">Workspace</div>
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={item.exact ? { exact: true } : undefined}
            activeProps={{
              className: 'bg-ink text-white border-ink shadow-[0_8px_20px_-12px_rgba(15,23,42,.6)]',
            }}
            inactiveProps={{
              className: 'text-ink-2 hover:bg-paper-2 border-transparent',
            }}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition"
          >
            <span className="opacity-90">{item.icon}</span>
            <span className="flex-1">
              <span className="block text-sm font-semibold leading-tight">{item.label}</span>
              <span className="block text-[11px] opacity-60">{item.hint}</span>
            </span>
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-5 pt-3 border-t border-rule">
        <div className="card-edit p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-2 text-white grid place-items-center font-bold text-sm shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-ink truncate">{user?.email}</div>
            <div className="text-[10px] text-ink-4">Signed in</div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-2 rounded-lg text-ink-3 hover:text-ink hover:bg-paper-2 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-dvh bg-paper text-ink">
      {/* Mobile topbar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-rule">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ink text-white grid place-items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-display font-bold tracking-tight">AmzWP</span>
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-lg border border-rule text-ink hover:bg-paper-2"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            )}
          </button>
        </div>
      </header>

      <div className="flex min-h-dvh">
        {/* Desktop sidebar */}
        <div className="hidden lg:block sticky top-0 h-dvh">{sidebar}</div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 animate-fade-in-up">{sidebar}</div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
