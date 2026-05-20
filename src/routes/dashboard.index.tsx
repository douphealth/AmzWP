import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export const Route = createFileRoute('/dashboard/')({
  head: () => ({
    meta: [{ title: 'Dashboard — AmzWP Automator' }],
  }),
  component: DashboardHome,
  errorComponent: ({ error, reset }) => (
    <div className="bg-dark-900 border border-red-500/30 rounded-2xl p-8 text-center">
      <h2 className="text-xl font-black mb-2">Couldn't load overview</h2>
      <p className="text-gray-400 text-sm mb-5">{error.message}</p>
      <button
        onClick={reset}
        className="bg-white text-dark-950 px-5 py-2.5 rounded-xl font-bold hover:bg-brand-400 hover:text-white transition"
      >
        Retry
      </button>
    </div>
  ),
});

function DashboardHome() {
  const [stats, setStats] = useState({ sites: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const db = supabase as any;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sites, posts] = await Promise.all([
        db.from('sites').select('id', { count: 'exact', head: true }),
        db.from('generated_blog_posts').select('id', { count: 'exact', head: true }),
      ]);
      if (cancelled) return;
      setStats({
        sites: sites.error ? 0 : sites.count ?? 0,
        posts: posts.error ? 0 : posts.count ?? 0,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onboardingComplete = stats.sites > 0 && stats.posts > 0;

  return (
    <div className="space-y-10">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl border border-dark-800 bg-gradient-to-br from-dark-900 via-dark-900 to-brand-950/30 p-8">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-300 font-bold">
            Welcome back
          </span>
          <h1 className="text-3xl md:text-4xl font-black mt-2 mb-2">Your automation overview.</h1>
          <p className="text-gray-400 max-w-xl">
            Connect WordPress sites, run scans, and let AmzWP keep your affiliate content fresh.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="WordPress sites"
          value={stats.sites}
          loading={loading}
          icon="M3 7h18M3 12h18M3 17h18"
          accent="from-brand-400 to-brand-600"
        />
        <StatCard
          label="Generated posts"
          value={stats.posts}
          loading={loading}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          accent="from-violet-400 to-violet-600"
        />
        <StatCard
          label="Auto-refreshes"
          value={0}
          loading={loading}
          hint="Pro feature · soon"
          icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          accent="from-emerald-400 to-emerald-600"
          muted
        />
      </div>

      {/* Onboarding checklist */}
      {!onboardingComplete && (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Get to your first published post</h2>
              <p className="text-sm text-gray-500">Two steps. Five minutes.</p>
            </div>
            <span className="text-xs font-bold text-brand-300 bg-brand-500/10 border border-brand-500/30 px-3 py-1 rounded-full">
              {[stats.sites > 0, stats.posts > 0].filter(Boolean).length} / 2
            </span>
          </div>
          <div className="space-y-3">
            <ChecklistItem
              done={stats.sites > 0}
              title="Connect a WordPress site"
              desc="Add the site you want to publish to."
              href="/dashboard/sites"
              cta="Add site"
            />
            <ChecklistItem
              done={stats.posts > 0}
              title="Generate your first post"
              desc="Open the generator and run your first scan."
              href="/dashboard/generator"
              cta="Open generator"
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard
          title="Manage WordPress sites"
          desc="Add, remove, or configure the sites you publish to."
          to="/dashboard/sites"
          cta="Manage sites"
          icon="M3 7h18M3 12h18M3 17h18"
        />
        <ActionCard
          title="Open the generator"
          desc="Scan a sitemap and generate Amazon-affiliate content."
          to="/dashboard/generator"
          cta="Open generator"
          icon="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  loading,
  hint,
  icon,
  accent,
  muted,
}: {
  label: string;
  value: number;
  loading: boolean;
  hint?: string;
  icon: string;
  accent: string;
  muted?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 transition ${
      muted
        ? 'bg-dark-900/60 border-dark-800'
        : 'bg-dark-900 border-dark-800 hover:border-dark-700'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">{label}</p>
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${accent} ${muted ? 'opacity-40' : ''} flex items-center justify-center shadow-lg`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
      </div>
      {loading ? (
        <div className="h-10 w-20 bg-dark-800 rounded-lg animate-pulse" />
      ) : (
        <p className="text-4xl font-black tracking-tight">{value.toLocaleString()}</p>
      )}
      {hint && <p className="text-xs text-gray-600 mt-2 font-semibold">{hint}</p>}
    </div>
  );
}

function ChecklistItem({
  done,
  title,
  desc,
  href,
  cta,
}: {
  done: boolean;
  title: string;
  desc: string;
  href: '/dashboard/sites' | '/dashboard/generator';
  cta: string;
}) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition ${
      done
        ? 'bg-emerald-500/5 border-emerald-500/20'
        : 'bg-dark-950 border-dark-800 hover:border-dark-700'
    }`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        done
          ? 'bg-emerald-500 text-white'
          : 'bg-dark-800 border border-dark-700 text-gray-500'
      }`}>
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
        ) : (
          <span className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${done ? 'text-gray-400 line-through' : 'text-white'}`}>{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      {!done && (
        <Link
          to={href}
          className="text-xs font-bold bg-white text-dark-950 hover:bg-brand-400 hover:text-white px-3 py-2 rounded-lg transition flex-shrink-0"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

function ActionCard({
  title,
  desc,
  to,
  cta,
  icon,
}: {
  title: string;
  desc: string;
  to: '/dashboard/sites' | '/dashboard/generator';
  cta: string;
  icon: string;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden bg-dark-900 border border-dark-800 hover:border-brand-500/40 rounded-2xl p-6 flex flex-col transition"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm mb-5">{desc}</p>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-400 group-hover:text-brand-300 transition">
          {cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="group-hover:translate-x-0.5 transition-transform">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
