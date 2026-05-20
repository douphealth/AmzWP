/**
 * BlockInserter | Notion-style always-visible inline inserter
 * Lives between every block. Click "+" → opens a command menu with:
 *   - Text block
 *   - Product box (pick from staged products, ranked by relevance)
 *   - Add by ASIN / Amazon URL (instant fetch + insert)
 *   - Comparison table
 */

import React, { useEffect, useRef, useState } from 'react';
import { ProductDetails } from '../types';

interface BlockInserterProps {
  contextualProducts: ProductDetails[];
  onInsertText: () => void;
  onInsertProduct: (productId: string) => void;
  onInsertByAsin: (input: string) => Promise<void>;
  onInsertComparison?: () => void;
  hasComparison?: boolean;
}

export const BlockInserter: React.FC<BlockInserterProps> = ({
  contextualProducts,
  onInsertText,
  onInsertProduct,
  onInsertByAsin,
  onInsertComparison,
  hasComparison,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [asinInput, setAsinInput] = useState('');
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    setTimeout(() => inputRef.current?.focus(), 30);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const looksLikeAsin = /[A-Z0-9]{10}/i.test(query) || /amazon\./i.test(query);

  const filteredProducts = contextualProducts.filter(p =>
    !query.trim() ||
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.brand?.toLowerCase().includes(query.toLowerCase()),
  );

  const handleAsinSubmit = async (input: string) => {
    if (!input.trim()) return;
    setBusy(true);
    try {
      await onInsertByAsin(input.trim());
      setOpen(false);
      setQuery('');
      setAsinInput('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-7 flex items-center justify-center group/inserter"
      contentEditable={false}
    >
      {/* Thin baseline that fattens on hover */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200/0 group-hover/inserter:bg-slate-200 transition-colors" />

      {/* Always-visible (subtle) + button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`relative z-10 h-7 px-3 rounded-full flex items-center gap-1.5 border text-[10px] font-bold uppercase tracking-[2px] transition-all
          ${open
            ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
            : 'bg-white text-slate-400 border-slate-200 opacity-60 group-hover/inserter:opacity-100 hover:text-slate-900 hover:border-slate-300 hover:shadow-md'}`}
        aria-label="Insert block"
      >
        <span className="text-sm leading-none">＋</span>
        <span>Insert</span>
      </button>

      {/* Command menu */}
      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] max-w-[92vw] bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] z-50 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-3 border-b border-slate-100 bg-slate-50/60">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setAsinInput(e.target.value); }}
              onKeyDown={e => {
                if (e.key === 'Enter' && looksLikeAsin) {
                  e.preventDefault();
                  handleAsinSubmit(asinInput);
                }
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="Search products, or paste Amazon URL / ASIN…"
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2">
            {/* Quick-add by ASIN/URL — appears when input looks like one */}
            {looksLikeAsin && (
              <button
                disabled={busy}
                onClick={() => handleAsinSubmit(asinInput)}
                className="w-full text-left p-3 rounded-xl hover:bg-amber-50 border border-amber-200 bg-amber-50/40 mb-2 flex items-center gap-3 transition-colors disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  {busy ? <i className="fa-solid fa-spinner fa-spin" /> : <span className="text-base">🛒</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-900">
                    {busy ? 'Fetching from Amazon…' : 'Insert Amazon product'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">{asinInput}</div>
                </div>
                {!busy && <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">↵ Enter</span>}
              </button>
            )}

            {/* Staged products */}
            {filteredProducts.length > 0 && (
              <div className="mb-1">
                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[2px] text-slate-400">
                  {query ? 'Matches' : 'Suggested for this spot'}
                </div>
                {filteredProducts.slice(0, 6).map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onInsertProduct(p.id); setOpen(false); setQuery(''); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-10 h-10 object-contain bg-slate-50 rounded-lg p-1 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">📦</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-slate-900 truncate">{p.title}</div>
                      <div className="text-[11px] text-slate-500">{p.price} · {p.brand || 'Amazon'}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Block types */}
            {!query && (
              <>
                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[2px] text-slate-400 mt-1">Blocks</div>
                <button
                  onClick={() => { onInsertText(); setOpen(false); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">¶</div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">Text</div>
                    <div className="text-[11px] text-slate-500">Plain paragraph</div>
                  </div>
                </button>
                {onInsertComparison && !hasComparison && (
                  <button
                    onClick={() => { onInsertComparison(); setOpen(false); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">📊</div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">Comparison table</div>
                      <div className="text-[11px] text-slate-500">Side-by-side product specs</div>
                    </div>
                  </button>
                )}
              </>
            )}

            {!looksLikeAsin && filteredProducts.length === 0 && query && (
              <div className="p-4 text-center text-xs text-slate-400">
                No staged products match. Paste an Amazon URL or ASIN to fetch a new one.
              </div>
            )}
          </div>

          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Tip: paste any <code className="font-mono text-slate-600">amazon.com/dp/…</code> URL anywhere</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">esc</kbd>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockInserter;
