import React, { createContext, useContext } from 'react';
import { useRestaurants } from '@/hooks/useRestaurants';
import type { Restaurant } from '@/hooks/useRestaurants';

interface RestaurantContextValue {
  restaurants: Restaurant[];
  spinPool: Restaurant[];
  toggleSessionExclusion: (id: number) => void;
  resetSession: () => void;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const value = useRestaurants();
  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurantContext(): RestaurantContextValue {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurantContext must be used inside RestaurantProvider');
  return ctx;
}
