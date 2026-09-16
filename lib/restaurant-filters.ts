export type CuisineFilter = {
  id: string;
  label: string;
  tags: string[];
};

export const CUISINE_FILTERS: CuisineFilter[] = [
  { id: "all", label: "Tất cả", tags: [] },
  { id: "mon-nuoc", label: "Món nước", tags: ["pho", "bun", "nong"] },
  { id: "com", label: "Cơm", tags: ["com"] },
  { id: "cuon", label: "Cuốn", tags: ["cuon", "nhe"] },
];

export type FilterableRestaurant = {
  tags: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  openTime?: string | null;
  closeTime?: string | null;
};

export type RestaurantFilterState = {
  cuisineId: string;
  budgetMax: number | null;
  openNowOnly: boolean;
};

export function matchesBudget(
  restaurant: FilterableRestaurant,
  budgetMax: number | null,
): boolean {
  if (!budgetMax || budgetMax <= 0) return true;
  if (!restaurant.priceMin && !restaurant.priceMax) return true;
  if (restaurant.priceMin && restaurant.priceMin <= budgetMax) return true;
  if (restaurant.priceMax && restaurant.priceMax <= budgetMax) return true;
  return false;
}

export function matchesCuisine(
  restaurant: FilterableRestaurant,
  cuisineId: string,
): boolean {
  if (cuisineId === "all") return true;
  const filter = CUISINE_FILTERS.find((f) => f.id === cuisineId);
  if (!filter || filter.tags.length === 0) return true;
  return filter.tags.some((tag) => restaurant.tags.includes(tag));
}

export function filterRestaurants<T extends FilterableRestaurant>(
  restaurants: T[],
  state: RestaurantFilterState,
  isOpen: (r: T) => boolean | null,
): T[] {
  return restaurants.filter((restaurant) => {
    if (!matchesCuisine(restaurant, state.cuisineId)) return false;
    if (!matchesBudget(restaurant, state.budgetMax)) return false;
    if (state.openNowOnly) {
      const open = isOpen(restaurant);
      if (open === false) return false;
    }
    return true;
  });
}
