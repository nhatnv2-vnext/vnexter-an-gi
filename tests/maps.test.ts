import { describe, expect, it } from "vitest";
import { googleMapsSearchUrl } from "@/lib/maps";

describe("googleMapsSearchUrl", () => {
  it("builds a Google Maps search URL for an address", () => {
    const url = googleMapsSearchUrl("299 Trung Kính, Cầu Giấy");
    expect(url).toContain("https://www.google.com/maps/search/");
    expect(url).toContain("query=");
    expect(decodeURIComponent(url)).toContain("299 Trung Kính");
  });
});
