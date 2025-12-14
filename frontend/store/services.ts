import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Service } from '@/types';

interface ServicesState {
    services: Service[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
    cacheDuration: number; // 5 minutes en ms

    // Actions
    setServices: (services: Service[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateLastFetched: () => void;
    isCacheValid: () => boolean;
    invalidateCache: () => void;
    reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useServicesStore = create<ServicesState>()(
    devtools(
        (set, get) => ({
            services: [],
            isLoading: false,
            error: null,
            lastFetched: null,
            cacheDuration: CACHE_DURATION,

            setServices: (services) => set({ services, error: null }),

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error, isLoading: false }),

            updateLastFetched: () => set({ lastFetched: Date.now() }),

            isCacheValid: () => {
                const { lastFetched, cacheDuration } = get();
                if (!lastFetched) return false;
                return Date.now() - lastFetched < cacheDuration;
            },

            invalidateCache: () => set({ lastFetched: null }),
        }),
        {
            name: 'services-store',
        }
    )
);
