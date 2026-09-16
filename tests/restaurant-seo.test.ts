import { describe, expect, it } from "vitest";
import { buildRestaurantSeo } from "@/lib/restaurant-seo";

describe("buildRestaurantSeo", () => {
  it("builds title, description, and image from restaurant fields", () => {
    const seo = buildRestaurantSeo({
      name: "Tứ hải",
      description: "có cơm rang, phở bò.\nnên ăn cơm rang 3 chỉ",
      address: "299 Trung Kính",
      imageUrl: "/restaurants/x.jpg",
    });

    expect(seo.metaTitle).toContain("Tứ hải");
    expect(seo.metaTitle.length).toBeLessThanOrEqual(70);
    expect(seo.metaDescription).toContain("cơm rang");
    expect(seo.metaDescription).toContain("299 Trung Kính");
    expect(seo.metaDescription.length).toBeLessThanOrEqual(180);
    expect(seo.metaImageUrl).toBe("/restaurants/x.jpg");
  });
});
