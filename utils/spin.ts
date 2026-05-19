import type { Restaurant } from '@/hooks/useRestaurants';

export function pickWinner(pool: Restaurant[]): Restaurant | null {
  const eligible = pool.filter(
    (r) => r.eligible_for_wheel && !r.default_excluded && !r.session_excluded
  );
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const restaurant of eligible) {
    rand -= restaurant.weight;
    if (rand <= 0) return restaurant;
  }

  return eligible[eligible.length - 1];
}

export function getEligibleCount(pool: Restaurant[]): number {
  return pool.filter(
    (r) => r.eligible_for_wheel && !r.default_excluded && !r.session_excluded
  ).length;
}
