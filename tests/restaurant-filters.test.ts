import { describe, expect, it } from "vitest";
import { isOpenAt, formatHoursLabel } from "@/lib/restaurant-hours";
import {
  filterRestaurants,
  matchesBudget,
  matchesCuisine,
} from "@/lib/restaurant-filters";

describe("restaurant hours", () => {
  it("detects open windows including overnight", () => {
    expect(isOpenAt("08:00", "21:00", 12 * 60)).toBe(true);
    expect(isOpenAt("08:00", "21:00", 22 * 60)).toBe(false);
    expect(isOpenAt("18:00", "02:00", 20 * 60)).toBe(true);
    expect(isOpenAt("18:00", "02:00", 1 * 60)).toBe(true);
    expect(isOpenAt("18:00", "02:00", 10 * 60)).toBe(false);
    expect(isOpenAt(null, "21:00", 12 * 60)).toBe(null);
  });

  it("formats hours labels", () => {
    expect(formatHoursLabel("08:00", "21:00")).toBe("08:00–21:00");
    expect(formatHoursLabel(null, "21:00")).toBe("Mở đến 21:00");
  });
});

describe("restaurant filters", () => {
  const sample = [
    {
      id: "1",
      tags: ["com"],
      priceMin: 40000,
      priceMax: 60000,
      openTime: "08:00",
      closeTime: "21:00",
    },
    {
      id: "2",
      tags: ["pho", "bun"],
      priceMin: 35000,
      priceMax: 45000,
      openTime: "08:00",
      closeTime: "14:00",
    },
  ];

  it("matches cuisine and budget", () => {
    expect(matchesCuisine(sample[0], "com")).toBe(true);
    expect(matchesCuisine(sample[0], "mon-nuoc")).toBe(false);
    expect(matchesBudget(sample[0], 50000)).toBe(true);
    expect(matchesBudget(sample[0], 30000)).toBe(false);
  });

  it("filters open-now restaurants", () => {
    const noon = () => true;
    const closed = (r: (typeof sample)[number]) => r.id !== "2";
    expect(
      filterRestaurants(
        sample,
        { cuisineId: "all", budgetMax: null, openNowOnly: true },
        noon,
      ),
    ).toHaveLength(2);
    expect(
      filterRestaurants(
        sample,
        { cuisineId: "all", budgetMax: null, openNowOnly: true },
        (r) => (r.id === "2" ? false : true),
      ).map((r) => r.id),
    ).toEqual(["1"]);
    expect(closed(sample[1])).toBe(false);
  });
});
