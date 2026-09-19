import { describe, expect, it } from "vitest";
import {
  buildRestaurantPageMetadata,
  buildRestaurantSeo,
  isBrandFirstTitle,
  resolveRestaurantTitle,
} from "@/lib/restaurant-seo";

describe("buildRestaurantSeo", () => {
  it("builds title, description, and image from restaurant fields", () => {
    const seo = buildRestaurantSeo({
      name: "Tứ hải",
      description: "có cơm rang, phở bò.\nnên ăn cơm rang 3 chỉ",
      address: "299 Trung Kính",
      imageUrl: "/restaurants/x.jpg",
    });

    expect(seo.metaTitle).toContain("Tứ hải");
    expect(seo.metaTitle).toMatch(/Tứ hải.*Vnexter ăn gì/);
    expect(seo.metaTitle.length).toBeLessThanOrEqual(70);
    expect(seo.metaDescription).toContain("cơm rang");
    expect(seo.metaDescription).toContain("299 Trung Kính");
    expect(seo.metaDescription.length).toBeLessThanOrEqual(180);
    expect(seo.metaImageUrl).toBe("/restaurants/x.jpg");
  });
});

describe("isBrandFirstTitle", () => {
  it("flags titles that lead with the site brand", () => {
    expect(isBrandFirstTitle("Vnexter ăn gì — Bún bò Huế")).toBe(true);
    expect(isBrandFirstTitle("Vnexter an gi | Bun bo Hue")).toBe(true);
    expect(isBrandFirstTitle("Bún bò Huế | Vnexter ăn gì")).toBe(false);
  });
});

describe("resolveRestaurantTitle", () => {
  it("ignores brand-first custom titles", () => {
    const title = resolveRestaurantTitle("Bún bò Huế", "Vnexter ăn gì — Bún bò Huế");
    expect(title.startsWith("Bún bò Huế")).toBe(true);
    expect(title).not.toMatch(/^Vnexter/i);
  });

  it("keeps valid custom titles", () => {
    expect(resolveRestaurantTitle("Tứ hải", "Tứ Hải gần Trung Kính")).toBe(
      "Tứ Hải gần Trung Kính",
    );
  });
});

describe("buildRestaurantPageMetadata", () => {
  it("uses restaurant-specific keywords without the site brand", () => {
    const metadata = buildRestaurantPageMetadata({
      slug: "bun-bo-hue",
      name: "Bún bò Huế",
      description: "Nước dùng đậm, sả ớt thơm.",
      address: "P108 - 31 MAC THÁI TỔ",
      imageUrl: "/restaurants/img.jpg",
      tags: ["bun", "nong"],
      metaTitle: null,
      metaDescription: null,
      metaImageUrl: null,
    });

    expect(metadata.title).toEqual({
      absolute: "Bún bò Huế gần Trung Kính | Vnexter ăn gì",
    });
    expect(metadata.keywords).toContain("Bún bò Huế");
    expect(metadata.keywords).not.toContain("Vnexter ăn gì");
    expect(metadata.openGraph?.type).toBe("article");
    expect(metadata.alternates?.canonical).toBe("/restaurants/bun-bo-hue");
  });
});
