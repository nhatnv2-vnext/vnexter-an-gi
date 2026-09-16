import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("home page UI", () => {
  it("renders the four lunch-focused sections in the required order", () => {
    const page = projectFile("app/page.tsx");
    const hero = page.indexOf("<Hero");
    const spinner = page.indexOf("<SpinnerSection");
    const weather = page.indexOf("<WeatherSuggestion");
    const list = page.indexOf("<RestaurantList");

    expect(hero).toBeGreaterThan(-1);
    expect(spinner).toBeGreaterThan(hero);
    expect(weather).toBeGreaterThan(spinner);
    expect(list).toBeGreaterThan(weather);
  });

  it("keeps weather fetching out of the slot spinner", () => {
    const spinner = projectFile("components/SlotSpinner.tsx");
    const weather = projectFile("components/WeatherSuggestion.tsx");

    expect(spinner).not.toContain("/api/weather");
    expect(weather).toContain('fetch("/api/weather"');
  });

  it("announces slot winner without live-updating the spin window", () => {
    const spinner = projectFile("components/SlotSpinner.tsx");

    expect(spinner).toContain('className="sr-only" aria-live="polite"');
    expect(spinner).toContain("aria-hidden={spinning || undefined}");
    expect(spinner).toContain("restaurants.length === 0");
    expect(spinner).toContain("case-strip");
    expect(spinner).toContain("case-marker");
    expect(spinner).toContain("case-reveal");
    expect(spinner).toContain('from "next/image"');
  });

  it("uses optimized images for restaurant list items", () => {
    const card = projectFile("components/RestaurantCard.tsx");

    expect(card).toContain('from "next/image"');
    expect(card).toContain("<Image");
  });
});
