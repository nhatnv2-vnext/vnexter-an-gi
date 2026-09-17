import { describe, it, expect } from "vitest";
import {
  classifyWeather,
  buildLunchSuggestion,
  describeWeatherCode,
  weatherIconFromCode,
} from "@/lib/weather";

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

describe("describeWeatherCode", () => {
  it("maps common WMO codes to Vietnamese sky labels", () => {
    expect(describeWeatherCode(0)).toBe("Trời quang");
    expect(describeWeatherCode(3)).toBe("Nhiều mây");
    expect(describeWeatherCode(61)).toBe("Mưa nhẹ");
    expect(describeWeatherCode(95)).toBe("Giông");
  });
});

describe("weatherIconFromCode", () => {
  it("maps WMO codes to weather-app icons", () => {
    expect(weatherIconFromCode(0)).toBe("sun");
    expect(weatherIconFromCode(2)).toBe("partly-cloudy");
    expect(weatherIconFromCode(3)).toBe("cloudy");
    expect(weatherIconFromCode(45)).toBe("fog");
    expect(weatherIconFromCode(53)).toBe("drizzle");
    expect(weatherIconFromCode(61)).toBe("rain");
    expect(weatherIconFromCode(95)).toBe("storm");
    expect(weatherIconFromCode(71)).toBe("snow");
  });
});

describe("buildLunchSuggestion", () => {
  it("suggests hot dishes on rain and ranks restaurants by tag match", () => {
    const restaurants = [
      { id: "r1", slug: "quan-a", name: "Quán A", tags: ["bun", "cay", "trua"] },
      { id: "r2", slug: "quan-pho", name: "Quán Phở", tags: ["pho", "nong", "trua"] },
      { id: "r3", slug: "quan-bun-nong", name: "Quán Bún Nóng", tags: ["bun", "nong", "trua"] },
    ];
    const result = buildLunchSuggestion("rain", restaurants);
    expect(result.suggestionText).toMatch(/trưa/i);
    expect(result.suggestionText).toMatch(/mưa/i);
    expect(result.suggestionText).toMatch(/món nóng|phở|bún/i);
    expect(result.suggestedRestaurantSlug).toBe("quan-pho");
    expect(result.suggestionText).toContain("Quán Phở");
    expect(result.preferredTags).toEqual(["pho", "nong", "bun"]);
  });

  it("suggests air-conditioned or indoor dining on hot days", () => {
    const hotRestaurants = [
      { id: "r1", slug: "bun-nong", name: "Bún Nóng", tags: ["bun", "nong", "trua"] },
      { id: "r2", slug: "quan-mat-dieu-hoa", name: "Quán Mát Điều Hòa", tags: ["com", "dieuhoa", "trongnha"] },
    ];
    const result = buildLunchSuggestion("hot", hotRestaurants);
    expect(result.suggestionText).toMatch(/nắng nóng/i);
    expect(result.suggestionText).toMatch(/điều hòa|trong nhà/i);
    expect(result.suggestedRestaurantSlug).toBe("quan-mat-dieu-hoa");
    expect(result.suggestionText).toContain("Quán Mát Điều Hòa");
    expect(result.preferredTags).toEqual(["dieuhoa", "trongnha", "mat"]);
  });

  it("suggests hot dishes on cold weather and prefers nong tag", () => {
    const restaurants = [
      { id: "r1", slug: "bun-cay", name: "Bún Cay", tags: ["bun", "cay", "trua"] },
      { id: "r2", slug: "pho-nong", name: "Phở Nóng", tags: ["pho", "nong", "trua"] },
    ];
    const result = buildLunchSuggestion("cold", restaurants);
    expect(result.suggestionText).toMatch(/se lạnh/i);
    expect(result.suggestionText).toMatch(/món nóng|phở|bún/i);
    expect(result.suggestedRestaurantSlug).toBe("pho-nong");
    expect(result.suggestionText).toContain("Phở Nóng");
  });

  it("suggests lunch-appropriate restaurants on mild weather", () => {
    const restaurants = [
      { id: "r1", slug: "quan-trua", name: "Quán Trưa", tags: ["trua", "com"] },
      { id: "r2", slug: "quan-khac", name: "Quán Khác", tags: ["toi", "com"] },
    ];
    const result = buildLunchSuggestion("mild", restaurants);
    expect(result.suggestionText).toMatch(/dễ chịu/i);
    expect(result.suggestedRestaurantSlug).toBe("quan-trua");
    expect(result.suggestionText).toContain("Quán Trưa");
  });

  it("returns text without restaurant slug when no tag match", () => {
    const result = buildLunchSuggestion("rain", [
      { id: "x", slug: "quan-x", name: "Quán X", tags: ["khac", "toi"] },
    ]);
    expect(result.suggestionText.length).toBeGreaterThan(0);
    expect(result.suggestionText).toMatch(/mưa/i);
    expect(result.suggestionText).not.toContain("Quán X");
    expect(result.suggestedRestaurantSlug).toBeUndefined();
  });

  it("scores restaurants by weighted tag priority", () => {
    const restaurants = [
      { id: "r1", slug: "bun-only", name: "Bún Only", tags: ["bun", "trua"] },
      { id: "r2", slug: "pho-perfect", name: "Phở Perfect", tags: ["pho", "nong", "trua"] },
      { id: "r3", slug: "nong-only", name: "Nóng Only", tags: ["nong", "trua"] },
    ];
    const result = buildLunchSuggestion("rain", restaurants);
    expect(result.suggestedRestaurantSlug).toBe("pho-perfect");
  });

  it("picks higher-scored restaurant when multiple match", () => {
    const restaurants = [
      { id: "r1", slug: "mat-only", name: "Mat Only", tags: ["mat", "trua"] },
      { id: "r2", slug: "dieu-hoa-trong-nha", name: "Điều Hòa + Trong Nhà", tags: ["dieuhoa", "trongnha", "trua"] },
      { id: "r3", slug: "trong-nha-only", name: "Trong Nhà Only", tags: ["trongnha", "trua"] },
    ];
    const result = buildLunchSuggestion("hot", restaurants);
    expect(result.suggestedRestaurantSlug).toBe("dieu-hoa-trong-nha");
    expect(result.suggestionText).toContain("Điều Hòa + Trong Nhà");
  });
});
