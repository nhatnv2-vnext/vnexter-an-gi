import { describe, expect, it } from "vitest";
import { slugifyName, validateRestaurantInput } from "@/lib/restaurant-admin";

describe("slugifyName", () => {
  it("slugifies Vietnamese lunch names", () => {
    expect(slugifyName("Bún bò Huế")).toBe("bun-bo-hue");
    expect(slugifyName("Bún cá cay Hải Phòng")).toBe("bun-ca-cay-hai-phong");
  });
});

describe("validateRestaurantInput", () => {
  it("requires core fields", () => {
    const result = validateRestaurantInput({
      name: "Test",
      description: "Mô tả",
      address: "Trung Kính",
      imageUrl: "/restaurants/x.jpg",
      tags: "bun, trua",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.slug).toBe("test");
      expect(result.data.tags).toEqual(["bun", "trua"]);
    }
  });

  it("keeps newlines and emoji in description", () => {
    const result = validateRestaurantInput({
      name: "Test",
      description: "Có cơm rang\nNên ăn 😋",
      address: "Trung Kính",
      imageUrl: "/restaurants/x.jpg",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.description).toBe("Có cơm rang\nNên ăn 😋");
    }
  });

  it("accepts optional SEO meta fields", () => {
    const result = validateRestaurantInput({
      name: "Tứ Hải",
      description: "Mô tả",
      address: "Trung Kính",
      imageUrl: "/restaurants/x.jpg",
      metaTitle: "Tứ Hải gần Trung Kính",
      metaDescription: "Cơm rang và phở bò quanh 219 Trung Kính",
      metaImageUrl: "https://example.com/og.jpg",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.metaTitle).toBe("Tứ Hải gần Trung Kính");
      expect(result.data.metaDescription).toContain("Cơm rang");
      expect(result.data.metaImageUrl).toBe("https://example.com/og.jpg");
    }
  });

  it("rejects oversized meta title", () => {
    const bad = validateRestaurantInput({
      name: "Test",
      description: "Mô tả",
      address: "Trung Kính",
      imageUrl: "/restaurants/x.jpg",
      metaTitle: "x".repeat(71),
    });
    expect(bad.ok).toBe(false);
  });

  it("accepts https image URLs and rejects data URLs", () => {
    const ok = validateRestaurantInput({
      name: "Test",
      description: "Mô tả",
      address: "Trung Kính",
      imageUrl: "https://example.com/food.jpg",
    });
    expect(ok.ok).toBe(true);

    const bad = validateRestaurantInput({
      name: "Test",
      description: "Mô tả",
      address: "Trung Kính",
      imageUrl: "data:image/jpeg;base64,abc",
    });
    expect(bad.ok).toBe(false);
  });
});
