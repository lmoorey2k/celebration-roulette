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

  // Weight tier → internal multiplier for the weighted pick pool:
  //   1 (Normal)    → 1×  (~2% with 54 restaurants)
  //   2 (Boosted)   → 2×  (~4%)
  //   3 (Featured)  → 5×  (~9%)
  //   4 (Hot Pick)  → 10× (~16%)
  //   5 (Sponsored) → 50× (~48%)
  const WEIGHT_MULTIPLIER: Record<number, number> = { 1: 1, 2: 2, 3: 5, 4: 10, 5: 50 };

  // spinPool — unique list of eligible restaurants (for reel visuals & UI counts)
  const spinPool = useMemo(() => {
    return restaurants.filter(
      (r) => r.active && r.eligible_for_wheel && !r.session_excluded
    );
  }, [restaurants]);

  // weightedPool — same restaurants but duplicated by weight multiplier.
  // Used ONLY for picking the winner: Math.random() selects from this array,
  // so boosted restaurants have proportionally higher odds.
  const weightedPool = useMemo(() => {
    const weighted: Restaurant[] = [];
    for (const r of spinPool) {
      const mult = WEIGHT_MULTIPLIER[r.weight] ?? 1;
      for (let i = 0; i < mult; i++) {
        weighted.push(r);
      }
    }
    return weighted;
  }, [spinPool]);

  return { restaurants, spinPool, weightedPool, toggleSessionExclusion, resetSession, loadedFromApi };
}
