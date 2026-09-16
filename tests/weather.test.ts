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
      { id: "r1", name: "Quán A", tags: ["bun", "cay", "trua"] },
      { id: "r2", name: "Quán Phở", tags: ["pho", "nong", "trua"] },
      { id: "r3", name: "Quán Bún Nóng", tags: ["bun", "nong", "trua"] },
    ];
    const result = buildLunchSuggestion("rain", restaurants);
    expect(result.suggestionText).toMatch(/trưa/i);
    expect(result.suggestionText).toMatch(/mưa/i);
    expect(result.suggestionText).toMatch(/món nóng|phở|bún/i);
    expect(result.suggestedRestaurantId).toBe("r2");
    expect(result.suggestionText).toContain("Quán Phở");
    expect(result.preferredTags).toEqual(["pho", "nong", "bun"]);
  });

  it("suggests cool/light dishes on hot weather and ranks correctly", () => {
    const restaurants = [
      { id: "r1", name: "Bún Nóng", tags: ["bun", "nong", "trua"] },
      { id: "r2", name: "Gỏi Cuốn Mát", tags: ["cuon", "mat", "trua"] },
      { id: "r3", name: "Sinh Tố", tags: ["do-uong", "mat", "trua"] },
    ];
    const result = buildLunchSuggestion("hot", restaurants);
    expect(result.suggestionText).toMatch(/nắng nóng/i);
    expect(result.suggestionText).toMatch(/mát|nhẹ bụng|đồ uống/i);
    expect(result.suggestedRestaurantId).toBe("r2");
    expect(result.suggestionText).toContain("Gỏi Cuốn Mát");
    expect(result.preferredTags).toEqual(["mat", "cuon", "do-uong", "nhe"]);
  });

  it("suggests hot dishes on cold weather and prefers nong tag", () => {
    const restaurants = [
      { id: "r1", name: "Bún Cay", tags: ["bun", "cay", "trua"] },
      { id: "r2", name: "Phở Nóng", tags: ["pho", "nong", "trua"] },
    ];
    const result = buildLunchSuggestion("cold", restaurants);
    expect(result.suggestionText).toMatch(/se lạnh/i);
    expect(result.suggestionText).toMatch(/món nóng|phở|bún/i);
    expect(result.suggestedRestaurantId).toBe("r2");
    expect(result.suggestionText).toContain("Phở Nóng");
  });

  it("suggests lunch-appropriate restaurants on mild weather", () => {
    const restaurants = [
      { id: "r1", name: "Quán Trưa", tags: ["trua", "com"] },
      { id: "r2", name: "Quán Khác", tags: ["toi", "com"] },
    ];
    const result = buildLunchSuggestion("mild", restaurants);
    expect(result.suggestionText).toMatch(/dễ chịu/i);
    expect(result.suggestedRestaurantId).toBe("r1");
    expect(result.suggestionText).toContain("Quán Trưa");
  });

  it("returns text without restaurant id when no tag match", () => {
    const result = buildLunchSuggestion("rain", [
      { id: "x", name: "Quán X", tags: ["khac", "toi"] },
    ]);
    expect(result.suggestionText.length).toBeGreaterThan(0);
    expect(result.suggestionText).toMatch(/mưa/i);
    expect(result.suggestionText).not.toContain("Quán X");
    expect(result.suggestedRestaurantId).toBeUndefined();
  });

  it("scores restaurants by weighted tag priority", () => {
    const restaurants = [
      { id: "r1", name: "Bún Only", tags: ["bun", "trua"] },
      { id: "r2", name: "Phở Perfect", tags: ["pho", "nong", "trua"] },
      { id: "r3", name: "Nóng Only", tags: ["nong", "trua"] },
    ];
    const result = buildLunchSuggestion("rain", restaurants);
    expect(result.suggestedRestaurantId).toBe("r2");
  });

  it("picks higher-scored restaurant when multiple match", () => {
    const restaurants = [
      { id: "r1", name: "Mat Only", tags: ["mat", "trua"] },
      { id: "r2", name: "Mat + Cuon", tags: ["mat", "cuon", "trua"] },
      { id: "r3", name: "Cuon Only", tags: ["cuon", "trua"] },
    ];
    const result = buildLunchSuggestion("hot", restaurants);
    expect(result.suggestedRestaurantId).toBe("r2");
    expect(result.suggestionText).toContain("Mat + Cuon");
  });
});
