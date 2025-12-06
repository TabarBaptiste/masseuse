import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Review } from '@/types';

interface ReviewsState {
    reviews: Review[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
    cacheDuration: number; // 15 minutes en ms

    // Actions
    setReviews: (reviews: Review[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateLastFetched: () => void;
    isCacheValid: () => boolean;
    reset: () => void;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const useReviewsStore = create<ReviewsState>()(
    devtools(
        (set, get) => ({
            reviews: [],
            isLoading: false,
            error: null,
            lastFetched: null,
            cacheDuration: CACHE_DURATION,

            setReviews: (reviews) => set({ reviews, error: null }),

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error, isLoading: false }),

            updateLastFetched: () => set({ lastFetched: Date.now() }),

            isCacheValid: () => {
                const { lastFetched, cacheDuration } = get();
                if (!lastFetched) return false;
                return Date.now() - lastFetched < cacheDuration;
            },

            reset: () => set({
                reviews: [],
                isLoading: false,
                error: null,
                lastFetched: null
            }),
        }),
        {
            name: 'reviews-store',
        }
    )
);
