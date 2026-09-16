import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("home page UI", () => {
  it("renders hero, home sections, and footer", () => {
    const page = projectFile("app/page.tsx");
    const hero = page.indexOf("<Hero");
    const sections = page.indexOf("<HomeSections");
    const footer = page.indexOf("<SiteFooter");

    expect(hero).toBeGreaterThan(-1);
    expect(sections).toBeGreaterThan(hero);
    expect(footer).toBeGreaterThan(sections);
  });

  it("embeds Google Maps for 219 Trung Kinh in the homepage footer", () => {
    const footer = projectFile("components/SiteFooter.tsx");

    expect(footer).toContain("google.com/maps");
    expect(footer).toContain("219");
    expect(footer).toContain("Trung K");
    expect(footer).toContain("IntersectionObserver");
    expect(footer).toContain("mapLoaded");
  });

  it("keeps weather fetching out of the slot spinner", () => {
    const spinner = projectFile("components/SlotSpinner.tsx");
    const weather = projectFile("components/WeatherSuggestion.tsx");

    expect(spinner).not.toContain("/api/weather");
    expect(weather).not.toContain('fetch("/api/weather"');
    expect(weather).toContain("LunchWeatherPayload");
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
