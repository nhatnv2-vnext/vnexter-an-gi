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
  const restaurants = [
    { id: "r1", tags: ["bun", "nong", "trua"] },
    { id: "r2", tags: ["bun", "cay", "trua"] },
  ];

  it("suggests bun lunch on rain and picks bun/nong restaurant", () => {
    const result = buildLunchSuggestion("rain", restaurants);
    expect(result.suggestionText).toMatch(/trưa/i);
    expect(result.suggestionText).toMatch(/bún bò|bún cá|món nóng/i);
    expect(result.suggestedRestaurantId).toBe("r1");
    expect(result.preferredTags).toContain("bun");
  });

  it("suggests bun lunch on hot and picks bun-tagged restaurant", () => {
    const result = buildLunchSuggestion("hot", restaurants);
    expect(result.suggestionText).toMatch(/trưa/i);
    expect(result.suggestedRestaurantId).toBe("r1");
  });

  it("returns text without restaurant id when no tag match", () => {
    const result = buildLunchSuggestion("rain", [{ id: "x", tags: ["khac"] }]);
    expect(result.suggestionText.length).toBeGreaterThan(0);
    expect(result.suggestedRestaurantId).toBeUndefined();
  });
});
