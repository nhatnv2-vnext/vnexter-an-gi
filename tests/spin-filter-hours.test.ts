import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("spin filter by cuisine", () => {
  it("includes cuisine filter chips in SlotSpinner", () => {
    const spinner = projectFile("components/SlotSpinner.tsx");

    expect(spinner).toContain("CUISINE_FILTERS");
    expect(spinner).toContain("filter-chip");
    expect(spinner).toContain("selectedFilter");
    expect(spinner).toContain('label: "Tất cả"');
    expect(spinner).toContain('label: "Món nước"');
    expect(spinner).toContain('label: "Cơm"');
    expect(spinner).toContain('label: "Cuốn"');
  });

  it("filters restaurants based on selected cuisine", () => {
    const spinner = projectFile("components/SlotSpinner.tsx");

    expect(spinner).toContain("filteredRestaurants");
    expect(spinner).toContain("filter.tags.some");
    expect(spinner).toContain("r.tags.includes");
  });

  it("shows empty state when no restaurants match filter", () => {
    const spinner = projectFile("components/SlotSpinner.tsx");

    expect(spinner).toContain("filteredRestaurants.length === 0");
    expect(spinner).toContain("restaurants.length > 0");
    expect(spinner).toContain("Không có quán nào phù hợp");
  });

  it("disables spin button when no restaurants match filter", () => {
    const spinner = projectFile("components/SlotSpinner.tsx");

    expect(spinner).toContain("disabled={spinning || filteredRestaurants.length === 0}");
  });

  it("passes tags to SlotSpinner from home page", () => {
    const page = projectFile("app/page.tsx");

    expect(page).toMatch(/tags[,}]/);
  });
});

describe("open hours badge", () => {
  it("adds openTime and closeTime fields to Prisma schema", () => {
    const schema = projectFile("prisma/schema.prisma");

    expect(schema).toContain("openTime");
    expect(schema).toContain("closeTime");
    expect(schema).toContain("String?");
  });

  it("includes hours fields in RestaurantForm", () => {
    const form = projectFile("components/admin/RestaurantForm.tsx");

    expect(form).toContain("openTime");
    expect(form).toContain("closeTime");
    expect(form).toContain("Giờ mở cửa");
    expect(form).toContain("Giờ đóng cửa");
  });

  it("validates and saves hours in restaurant-admin", () => {
    const admin = projectFile("lib/restaurant-admin.ts");

    expect(admin).toContain("openTime");
    expect(admin).toContain("closeTime");
  });

  it("displays hours badge in RestaurantCard", () => {
    const card = projectFile("components/RestaurantCard.tsx");

    expect(card).toContain("hoursLabel");
    expect(card).toContain("restaurant-hours-badge");
    expect(card).toContain("Mở đến");
  });

  it("styles hours badge in CSS", () => {
    const css = projectFile("app/globals.css");

    expect(css).toContain(".restaurant-hours-badge");
  });
});
