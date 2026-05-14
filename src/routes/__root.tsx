import type { ReactNode } from 'react';
import {
  Link,
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';
import appCss from '../styles.css?url';
import { AuthProvider } from '../lib/auth';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      { title: 'AmzWP Automator — Amazon affiliate WordPress automation' },
      { name: 'description', content: 'AI-powered Amazon-affiliate content for WordPress. Scan sitemaps, auto-insert SEO product boxes, refresh prices, publish at scale.' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'AmzWP Automator' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
      },
    ],
  }),
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: () => (
    <RootDocument>
      <div className="min-h-screen flex items-center justify-center bg-dark-950 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">404</h1>
          <p className="text-gray-400">Page not found</p>
        </div>
      </div>
    </RootDocument>
  ),
});

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  console.error(error);

  return (
    <RootDocument>
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-8">
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
    </RootDocument>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <RootDocument>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="min-h-screen bg-dark-950 flex items-center justify-center p-8">
            <div className="bg-dark-900 border border-red-500/30 rounded-3xl p-8 max-w-lg text-center">
              <h1 className="text-2xl font-black text-white mb-4">
                Application Error
              </h1>
              <p className="text-gray-400 mb-6">{error.message}</p>
              <button
                onClick={resetErrorBoundary}
                className="bg-white text-dark-950 px-6 py-3 rounded-xl font-bold hover:bg-brand-500 hover:text-white transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Outlet />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-dark-950 text-slate-200 antialiased">
        <div id="root">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
