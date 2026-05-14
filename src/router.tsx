import { QueryClient } from '@tanstack/react-query';
import { Link, createRouter, useRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  console.error(error);

  return (
    <div className="min-h-dvh bg-dark-950 flex items-center justify-center p-8">
      <div className="bg-dark-900 border border-red-500/30 rounded-3xl p-8 max-w-lg text-center">
        <h1 className="text-2xl font-black text-white mb-4">Application Error</h1>
        <p className="text-gray-400 mb-6">{error.message}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-white text-dark-950 px-6 py-3 rounded-xl font-bold hover:bg-brand-500 hover:text-white transition-all"
          >
            Try again
          </button>
          <Link
            to="/"
            className="border border-dark-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-dark-800 transition-all"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 30,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultErrorComponent: DefaultErrorComponent,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });

  return router;
};

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
