import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface WorkingDaysState {
    workingDays: string[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
    cacheDuration: number; // 1 heure en ms

    // Actions
    setWorkingDays: (days: string[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateLastFetched: () => void;
    isCacheValid: () => boolean;
    reset: () => void;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

export const useWorkingDaysStore = create<WorkingDaysState>()(
    devtools(
        (set, get) => ({
            workingDays: [],
            isLoading: false,
            error: null,
            lastFetched: null,
            cacheDuration: CACHE_DURATION,

            setWorkingDays: (days) => set({ workingDays: days, error: null }),

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error, isLoading: false }),

            updateLastFetched: () => set({ lastFetched: Date.now() }),

            isCacheValid: () => {
                const { lastFetched, cacheDuration } = get();
                if (!lastFetched) return false;
                return Date.now() - lastFetched < cacheDuration;
            },

            reset: () => set({
                workingDays: [],
                isLoading: false,
                error: null,
                lastFetched: null
            }),
        }),
        {
            name: 'working-days-store',
        }
    )
);
