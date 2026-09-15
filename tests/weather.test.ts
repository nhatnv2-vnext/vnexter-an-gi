import { describe, it, expect } from "vitest";
import { classifyWeather, buildLunchSuggestion } from "@/lib/weather";

describe("classifyWeather", () => {
  it("classifies rain weather codes as rain", () => {
    expect(classifyWeather(28, 61)).toBe("rain");
    expect(classifyWeather(25, 95)).toBe("rain");
  });

  it("classifies hot when temp >= 33 and not rain", () => {
    expect(classifyWeather(34, 0)).toBe("hot");
  });

  it("classifies cold when temp <= 20 and not rain", () => {
    expect(classifyWeather(18, 1)).toBe("cold");
  });

  it("classifies mild otherwise", () => {
    expect(classifyWeather(27, 2)).toBe("mild");
  });
});

describe("buildLunchSuggestion", () => {
  const restaurants = [
    { id: "r1", tags: ["pho", "nong", "trua"] },
    { id: "r2", tags: ["mat", "trua"] },
  ];

  it("suggests pho lunch on rain and picks pho-tagged restaurant", () => {
    const result = buildLunchSuggestion("rain", restaurants);
    expect(result.suggestionText).toMatch(/trưa/i);
    expect(result.suggestionText).toMatch(/phở|món nóng/i);
    expect(result.suggestedRestaurantId).toBe("r1");
    expect(result.preferredTags).toContain("pho");
  });

  it("suggests cool lunch on hot and picks mat-tagged restaurant", () => {
    const result = buildLunchSuggestion("hot", restaurants);
    expect(result.suggestionText).toMatch(/trưa/i);
    expect(result.suggestedRestaurantId).toBe("r2");
  });

  it("returns text without restaurant id when no tag match", () => {
    const result = buildLunchSuggestion("rain", [{ id: "x", tags: ["khac"] }]);
    expect(result.suggestionText.length).toBeGreaterThan(0);
    expect(result.suggestedRestaurantId).toBeUndefined();
  });
});
