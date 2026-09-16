import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("price range / budget filter", () => {
  it("adds priceMin and priceMax fields to Prisma schema", () => {
    const schema = projectFile("prisma/schema.prisma");

    expect(schema).toContain("priceMin");
    expect(schema).toContain("priceMax");
    expect(schema).toContain("Int?");
  });

  it("includes price fields in RestaurantForm", () => {
    const form = projectFile("components/admin/RestaurantForm.tsx");

    expect(form).toContain("priceMin");
    expect(form).toContain("priceMax");
    expect(form).toContain("Giá từ");
    expect(form).toContain("Giá đến");
    expect(form).toContain('type="number"');
  });

  it("validates and saves price range in restaurant-admin", () => {
    const admin = projectFile("lib/restaurant-admin.ts");

    expect(admin).toContain("priceMin");
    expect(admin).toContain("priceMax");
  });

  it("displays price badge in RestaurantCard with correct format", () => {
    const card = projectFile("components/RestaurantCard.tsx");

    expect(card).toContain("priceLabel");
    expect(card).toContain("restaurant-price-badge");
    expect(card).toContain("/ 1000");
    expect(card).toContain("toFixed(0)");
  });

  it("includes BudgetFilter component with Vietnamese labels", () => {
    const filter = projectFile("components/BudgetFilter.tsx");

    expect(filter).toContain("BUDGET_OPTIONS");
    expect(filter).toContain("Tìm quán trong khoảng giá");
    expect(filter).toContain("Bất kỳ");
    expect(filter).toContain("≤ 30k");
    expect(filter).toContain("≤ 50k");
    expect(filter).toContain("≤ 80k");
  });

  it("lifts budget filter through HomeSections", () => {
    const home = projectFile("components/HomeSections.tsx");
    const page = projectFile("app/page.tsx");

    expect(home).toContain("BudgetFilter");
    expect(home).toContain("SlotSpinner");
    expect(home).toContain("budgetMax");
    expect(home).toContain("filterRestaurants");
    expect(page).toContain("HomeSections");
  });

  it("styles budget filter and price badge in CSS", () => {
    const css = projectFile("app/globals.css");

    expect(css).toContain(".budget-filter");
    expect(css).toContain(".budget-filter-label");
    expect(css).toContain(".restaurant-price-badge");
  });
});
