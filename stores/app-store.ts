import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppConfig, AppStep, BlogPost, SitemapState } from '../types';
import { AppConfigSchema, SitemapStateSchema } from '../schemas';

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const DEFAULT_CONFIG: AppConfig = {
  amazonTag: '',
  amazonAccessKey: '',
  amazonSecretKey: '',
  amazonRegion: 'us-east-1',
  wpUrl: '',
  wpUser: '',
  wpAppPassword: '',
  serpApiKey: '',
  autoPublishThreshold: 85,
  concurrencyLimit: 5,
  enableSchema: true,
  enableStickyBar: true,
  boxStyle: 'PREMIUM',
  aiProvider: 'gemini',
  aiModel: 'gemini-2.0-flash',
  serpApiCallBudget: 8,
  serpApiMinCandidateScore: 35,
};

interface AppState {
  hasEntered: boolean;
  config: AppConfig;
  sitemap: SitemapState;
  currentStep: AppStep;
  selectedPost: BlogPost | null;

  enter: () => void;
  updateConfig: (config: Partial<AppConfig>) => void;
  setSitemap: (state: SitemapState) => void;
  setStep: (step: AppStep) => void;
  setSelectedPost: (post: BlogPost | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasEntered: false,
      config: DEFAULT_CONFIG,
      sitemap: { url: '', posts: [] },
      currentStep: AppStep.SITEMAP,
      selectedPost: null,

      enter: () => set({ hasEntered: true }),
      updateConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial } })),
      setSitemap: (sitemap) => set({ sitemap }),
      setStep: (step) => set({ currentStep: step }),
      setSelectedPost: (post) => set({ selectedPost: post }),
    }),
    {
      name: 'amzwp-store-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : noopStorage
      ),
      partialize: (state) => ({
        hasEntered: state.hasEntered,
        config: state.config,
        sitemap: state.sitemap,
      }),
    }
  )
);
