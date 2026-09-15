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
});
