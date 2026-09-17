"use client";

import { useMemo, useState } from "react";
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
  const [budgetMax, setBudgetMax] = useState<number | null>(null);
  const [cuisineId, setCuisineId] = useState("all");
  const [openNowOnly, setOpenNowOnly] = useState(false);

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
              <BudgetFilter value={budgetMax} onChange={setBudgetMax} />
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
                      onClick={() => setCuisineId(filter.id)}
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
                  onClick={() => setOpenNowOnly((v) => !v)}
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
