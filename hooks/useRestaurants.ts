import { useState, useCallback, useEffect, useMemo } from 'react';
import rawData from '@/data/restaurants.json';

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  website_url: string;
  source_url: string;
  logo_url: string;
  active: boolean;
  eligible_for_wheel: boolean;
  default_excluded: boolean;
  weight: number;
  notes: string;
  categories: string[];
  phone: string;
  menu_url: string;
  session_excluded: boolean;
}

// API endpoint — update this after deploying to Vercel
const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

// Admin odds tier -> internal multiplier for winner selection.
// Existing data stays compatible: 1 is still Normal, 4 is still Hot Pick,
// and 5 is still Sponsored. New lower tiers allow restaurants to remain
// visible while being less likely to win.
export const ODDS_MULTIPLIER: Record<number, number> = {
  [-2]: 0.1,
  [-1]: 0.25,
  0: 0.5,
  1: 1,
  2: 2,
  3: 5,
  4: 10,
  5: 50,
};

export function getOddsMultiplier(weight: number | null | undefined): number {
  return ODDS_MULTIPLIER[weight ?? 1] ?? 1;
}

function hydrate(raw: any[]): Restaurant[] {
  return raw.map((r) => ({
    categories: [],
    phone: '',
    menu_url: '',
    logo_url: '',
    ...r,
    session_excluded: r.default_excluded,
  }));
}

function hydrateFromLocal(): Restaurant[] {
  return hydrate((rawData.restaurants as any[]));
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(hydrateFromLocal);
  const [loadedFromApi, setLoadedFromApi] = useState(false);

  // Fetch from live API on mount; fall back to static JSON if unavailable
  useEffect(() => {
    if (!API_URL) return; // no API configured yet — use static JSON
    fetch(`${API_URL}/api/restaurants`)
      .then(r => r.json())
      .then(data => {
        if (data.restaurants?.length) {
          setRestaurants(hydrate(data.restaurants));
          setLoadedFromApi(true);
        }
      })
      .catch(() => {
        // Network error — keep static JSON data as fallback
      });
  }, []);

  const toggleSessionExclusion = useCallback((id: number) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, session_excluded: !r.session_excluded } : r
      )
    );
  }, []);

  const resetSession = useCallback(() => {
    setRestaurants(prev => prev.map(r => ({ ...r, session_excluded: r.default_excluded })));
  }, []);

  // spinPool — unique list of eligible restaurants (for reel visuals & UI counts)
  const spinPool = useMemo(() => {
    return restaurants.filter(
      (r) => r.active && r.eligible_for_wheel && !r.session_excluded
    );
  }, [restaurants]);

  // weightedPool — eligible restaurants for winner selection. It intentionally
  // stays unique; SlotMachine applies getOddsMultiplier() during the weighted
  // random pick so fractional "less likely" tiers work cleanly.
  const weightedPool = useMemo(() => {
    return spinPool;
  }, [spinPool]);

  return { restaurants, spinPool, weightedPool, toggleSessionExclusion, resetSession, loadedFromApi };
}
