import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SiteSettings } from '@/types';

interface SiteSettingsState {
    settings: SiteSettings | null;
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
    cacheDuration: number; // 1 heure en ms

    // Actions
    setSettings: (settings: SiteSettings) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateLastFetched: () => void;
    isCacheValid: () => boolean;
    reset: () => void;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

export const useSiteSettingsStore = create<SiteSettingsState>()(
    devtools(
        (set, get) => ({
            settings: null,
            isLoading: false,
            error: null,
            lastFetched: null,
            cacheDuration: CACHE_DURATION,

            setSettings: (settings) => set({ settings, error: null }),

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error, isLoading: false }),

            updateLastFetched: () => set({ lastFetched: Date.now() }),

            isCacheValid: () => {
                const { lastFetched, cacheDuration } = get();
                if (!lastFetched) return false;
                return Date.now() - lastFetched < cacheDuration;
            },

            reset: () => set({
                settings: null,
                isLoading: false,
                error: null,
                lastFetched: null
            }),
        }),
        {
            name: 'site-settings-store',
        }
    )
);
