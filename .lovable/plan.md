## What’s happening
The error is not coming from the visible dashboard UI itself. The live Worker is failing during server-side rendering startup, which is why `/`, `/dashboard`, and even `/api/public/health` all return the same fallback 500 page in production while local dev still works.

## Most likely root cause
A browser-only import path is being pulled into the server bundle for published SSR.

The strongest suspect path is:

```text
src/routes/dashboard.generator.tsx
→ App.tsx
→ components/ConfigPanel.tsx / stores/app-store.ts / components/PostEditor.tsx / components/SitemapScanner.tsx
→ utils.ts
```

That shared `utils.ts` module is very large and contains browser-specific storage/crypto behavior (`localStorage`, `window`, browser Web Crypto assumptions). On a Cloud Worker SSR bundle, that kind of code can crash module initialization or route startup even if dev appears fine.

## Plan
1. **Make the generator route SSR-safe**
   - Stop statically importing the heavy editor app into `src/routes/dashboard.generator.tsx`.
   - Convert it to a client-only/lazy boundary so the server does not import the generator toolchain just to boot the app.

2. **Split browser-only utilities out of `utils.ts`**
   - Extract cache/storage helpers and any browser-only behavior into a dedicated client-safe module.
   - Keep server-safe lookup/parsing/request helpers in an SSR-safe module.
   - Update imports in `ConfigPanel`, `PostEditor`, `SitemapScanner`, and `app-store` so SSR routes only touch safe code.

3. **Guard browser globals explicitly**
   - Add safe fallbacks around `localStorage`, `window`, and browser-only crypto usage.
   - Ensure storage/cache code no-ops cleanly during SSR instead of throwing.

4. **Improve crash visibility**
   - Tighten server-side logging around catastrophic SSR startup so future production crashes expose the actual failing import path instead of only the generic fallback page.

5. **Validate against production behavior**
   - Verify local `/`, `/dashboard`, and `/api/public/health` still return 200.
   - Verify the preview/published deployment no longer returns the fallback 500 page.
   - Then publish the frontend update so the live site uses the repaired bundle.

## Technical details
- The failure pattern matches a **production-only SSR/runtime bundling problem**, not a normal React render bug.
- The fact that **every route fails** means the Worker likely crashes while loading the app bundle or route graph, before route-specific logic finishes.
- `src/routeTree.gen.ts` statically registers route modules, so one unsafe route import can poison the whole SSR bundle.
- `dashboard.generator.tsx` is the highest-risk route because it eagerly imports the heavy app shell and shared utility graph.

## Expected outcome
After this refactor, the published app should stop showing the generic “Internal server error” page on hard loads, and the generator/editor code will only load where it’s actually needed instead of breaking the whole server render.