import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

interface Site {
  id: string;
  name: string;
  url: string;
  status: string;
  created_at: string;
}

export const Route = createFileRoute('/dashboard/sites')({
  head: () => ({
    meta: [{ title: 'WordPress Sites — AmzWP Automator' }],
  }),
  component: SitesPage,
  errorComponent: ({ error, reset }) => (
    <div className="bg-dark-900 border border-red-500/30 rounded-2xl p-8 text-center">
      <h2 className="text-xl font-black mb-2">Couldn't load sites</h2>
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

function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const db = supabase as any;

  const load = async () => {
    setLoading(true);
    const { data, error } = await db
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setSites((data as Site[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!name.trim() || !url.trim()) {
      toast.error('Name and URL are required');
      return;
    }
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) normalized = 'https://' + normalized;
    try {
      new URL(normalized);
    } catch {
      toast.error('Invalid URL');
      return;
    }
    setBusy(true);
    const { data: userResp } = await supabase.auth.getUser();
    const userId = userResp.user?.id;
    if (!userId) {
      toast.error('Not authenticated');
      setBusy(false);
      return;
    }
    const { error } = await db
      .from('sites')
      .insert({ name: name.trim(), url: normalized, user_id: userId });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setName('');
    setUrl('');
    toast.success('Site added');
    load();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this site?')) return;
    const { error } = await db.from('sites').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Deleted');
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-2">WordPress sites</h1>
        <p className="text-gray-500">Connect the WP sites you want to publish to.</p>
      </div>

      <form
        onSubmit={onAdd}
        className="bg-dark-900 border border-dark-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-end"
      >
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Affiliate Blog"
            className="mt-2 w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://myblog.com"
            className="mt-2 w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition"
        >
          {busy ? 'Adding…' : 'Add site'}
        </button>
      </form>

      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading…</div>
        ) : sites.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No sites yet — add your first WP site above.
          </div>
        ) : (
          <ul className="divide-y divide-dark-800">
            {sites.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-dark-800/40 transition"
              >
                <div>
                  <p className="font-bold">{s.name}</p>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-500 hover:text-brand-400"
                  >
                    {s.url}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(s.id)}
                  className="text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-red-400 transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
