import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AppShell } from './shell/app-shell';
import { useAppStore } from './stores/app-store';
import { AppStep } from './types';
import { ConfigPanel } from './components/ConfigPanel';
import { LandingPage } from './components/LandingPage';

// Code-split heavy editor + scanner — only loaded when their step is active.
const SitemapScanner = lazy(() =>
  import('./components/SitemapScanner').then((m) => ({ default: m.SitemapScanner }))
);

const PostEditor = lazy(() =>
  import('./components/PostEditor').then((m) => ({ default: m.PostEditor }))
);

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-brand-500 rounded-full animate-spin" />
      </div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{message}</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const hasEntered = useAppStore((s) => s.hasEntered);
  const enter = useAppStore((s) => s.enter);
  const config = useAppStore((s) => s.config);
  const updateConfig = useAppStore((s) => s.updateConfig);
  const currentStep = useAppStore((s) => s.currentStep);
  const sitemap = useAppStore((s) => s.sitemap);
  const setSitemap = useAppStore((s) => s.setSitemap);
  const selectedPost = useAppStore((s) => s.selectedPost);
  const setSelectedPost = useAppStore((s) => s.setSelectedPost);
  const setStep = useAppStore((s) => s.setStep);

  if (!hasEntered) {
    return (
      <AppShell>
        <LandingPage onEnter={enter} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ConfigPanel initialConfig={config} onSave={updateConfig} />

      <main className="flex-1 w-full h-full relative overflow-hidden">
        {currentStep === AppStep.SITEMAP && (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div className="flex items-center justify-center h-full p-8">
                <div className="bg-dark-900 border border-red-500/30 rounded-2xl p-6 max-w-md text-center">
                  <h2 className="text-lg font-bold text-white mb-2">Scanner Error</h2>
                  <p className="text-gray-400 text-sm mb-4">{error.message}</p>
                  <button onClick={resetErrorBoundary} className="bg-brand-500 text-white px-4 py-2 rounded-xl font-bold text-sm">Retry</button>
                </div>
              </div>
            )}
          >
            <Suspense fallback={<LoadingSpinner message="Loading Scanner" />}>
              <SitemapScanner
                onPostSelect={(post) => {
                  setSelectedPost(post);
                  setStep(AppStep.EDITOR);
                }}
                savedState={sitemap}
                onStateChange={setSitemap}
                config={config}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {currentStep === AppStep.EDITOR && selectedPost && (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div className="flex items-center justify-center h-full p-8">
                <div className="bg-dark-900 border border-red-500/30 rounded-2xl p-6 max-w-md text-center">
                  <h2 className="text-lg font-bold text-white mb-2">Editor Error</h2>
                  <p className="text-gray-400 text-sm mb-2">{error.message}</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => { setSelectedPost(null); setStep(AppStep.SITEMAP); }} className="bg-dark-700 text-white px-4 py-2 rounded-xl font-bold text-sm">Back</button>
                    <button onClick={resetErrorBoundary} className="bg-brand-500 text-white px-4 py-2 rounded-xl font-bold text-sm">Retry</button>
                  </div>
                </div>
              </div>
            )}
          >
            <Suspense fallback={<LoadingSpinner message="Loading Editor" />}>
              <PostEditor
                key={selectedPost.id}
                post={selectedPost}
                config={config}
                onBack={() => {
                  setSelectedPost(null);
                  setStep(AppStep.SITEMAP);
                }}
                allPosts={sitemap.posts}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </main>

      <div id="global-progress" className="fixed bottom-0 left-0 right-0 h-1 bg-transparent pointer-events-none z-50" />
    </AppShell>
  );
};

export default App;
