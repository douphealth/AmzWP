import { Suspense, lazy } from 'react';
import { ClientOnly, createFileRoute } from '@tanstack/react-router';

const GeneratorApp = lazy(() => import('@/App'));

export const Route = createFileRoute('/dashboard/generator')({
  head: () => ({
    meta: [{ title: 'Generator — AmzWP Automator' }],
  }),
  component: GeneratorPage,
  errorComponent: ({ error, reset }) => (
    <div className="bg-dark-900 border border-red-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto mt-10">
      <h2 className="text-xl font-black mb-2">The generator hit an error</h2>
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

function GeneratorPage() {
  return (
    <div className="dark-canvas min-h-dvh overflow-hidden bg-dark-950">
      <ClientOnly
        fallback={
          <div className="min-h-dvh flex items-center justify-center bg-dark-950 text-gray-400">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              Loading generator…
            </div>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="min-h-dvh flex items-center justify-center bg-dark-950 text-gray-400">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                Loading generator…
              </div>
            </div>
          }
        >
          <GeneratorApp />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
