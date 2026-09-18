"use client";

import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RestaurantList } from "@/components/RestaurantList";
import type { RestaurantListItem } from "@/components/RestaurantCard";
import { SlotSpinner } from "@/components/SlotSpinner";
import { WeatherSuggestion } from "@/components/WeatherSuggestion";
import { BudgetFilter } from "@/components/BudgetFilter";
import {
  CUISINE_FILTERS,
  filterRestaurants,
} from "@/lib/restaurant-filters";
import { isOpenNow } from "@/lib/restaurant-hours";
import type { LunchWeatherPayload } from "@/lib/weather";

export type HomeRestaurant = RestaurantListItem & {
  tags: string[];
};

export function HomeSections({
  restaurants,
  weather,
}: {
  restaurants: HomeRestaurant[];
  weather: LunchWeatherPayload;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const budgetMax = useMemo(() => {
    const budget = searchParams.get("budget");
    return budget ? parseInt(budget, 10) : null;
  }, [searchParams]);

  const cuisineId = useMemo(
    () => searchParams.get("cuisine") || "all",
    [searchParams]
  );

  const openNowOnly = useMemo(
    () => searchParams.get("open") === "true",
    [searchParams]
  );

  const updateFilters = useCallback(
    (updates: {
      budget?: number | null;
      cuisine?: string;
      open?: boolean;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (updates.budget !== undefined) {
        if (updates.budget) {
          params.set("budget", updates.budget.toString());
        } else {
          params.delete("budget");
        }
      }
      
      if (updates.cuisine !== undefined) {
        if (updates.cuisine && updates.cuisine !== "all") {
          params.set("cuisine", updates.cuisine);
        } else {
          params.delete("cuisine");
        }
      }
      
      if (updates.open !== undefined) {
        if (updates.open) {
          params.set("open", "true");
        } else {
          params.delete("open");
        }
      }
      
      params.delete("page");
      
      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      router.push(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  const filtered = useMemo(
    () =>
      filterRestaurants(
        restaurants,
        { cuisineId, budgetMax, openNowOnly },
        (r) => isOpenNow(r.openTime, r.closeTime),
      ),
    [restaurants, cuisineId, budgetMax, openNowOnly],
  );

  return (
    <>
      <section className="spinner-section section-shell" id="quay-trua">
        <SlotSpinner
          restaurants={filtered.map(
            ({ id, slug, name, imageUrl, tags, priceMin, priceMax }) => ({
              id,
              slug,
              name,
              imageUrl,
              tags,
              priceMin,
              priceMax,
            }),
          )}
          totalAvailable={restaurants.length}
          budgetSlot={
            <div className="spinner-filters">
              <BudgetFilter 
                value={budgetMax} 
                onChange={(budget) => updateFilters({ budget })} 
              />
              <div className="cuisine-filter-group">
                <label className="cuisine-filter-label">Loại đồ ăn</label>
                <div className="cuisine-filters">
                  {CUISINE_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={`filter-chip${
                        cuisineId === filter.id ? " is-active" : ""
                      }`}
                      onClick={() => updateFilters({ cuisine: filter.id })}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="open-now-filter">
                <button
                  type="button"
                  className={`filter-chip${openNowOnly ? " is-active" : ""}`}
                  onClick={() => updateFilters({ open: !openNowOnly })}
                  aria-pressed={openNowOnly}
                >
                  Đang mở
                </button>
              </div>
            </div>
          }
        />
      </section>
      <WeatherSuggestion weather={weather} />
      <RestaurantList
        restaurants={filtered}
        totalUnfiltered={restaurants.length}
      />
    </>
  );
}
