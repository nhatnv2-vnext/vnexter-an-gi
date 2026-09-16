import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("spin filter by cuisine", () => {
  it("includes cuisine filter chips via shared filters", () => {
    const filters = projectFile("lib/restaurant-filters.ts");
    const home = projectFile("components/HomeSections.tsx");

    expect(filters).toContain("CUISINE_FILTERS");
    expect(filters).toContain('label: "Tất cả"');
    expect(filters).toContain('label: "Món nước"');
    expect(filters).toContain('label: "Cơm"');
    expect(filters).toContain('label: "Cuốn"');
    expect(home).toContain("CUISINE_FILTERS");
    expect(home).toContain("filter-chip");
  });

  it("filters restaurants based on selected cuisine", () => {
    const filters = projectFile("lib/restaurant-filters.ts");

    expect(filters).toContain("filterRestaurants");
    expect(filters).toContain("matchesCuisine");
    expect(filters).toContain("filter.tags.some");
  });

  it("shows empty state when no restaurants match filter", () => {
    const spinner = projectFile("components/SlotSpinner.tsx");

    expect(spinner).toContain("totalAvailable");
    expect(spinner).toContain("Không có quán nào phù hợp");
  });

  it("disables spin button when no restaurants match filter", () => {
    const spinner = projectFile("components/SlotSpinner.tsx");

    expect(spinner).toContain(
      "disabled={spinning || restaurants.length === 0}",
    );
  });

  it("passes tags through HomeSections", () => {
    const home = projectFile("components/HomeSections.tsx");
    const page = projectFile("app/page.tsx");

    expect(home).toMatch(/tags/);
    expect(page).toContain("HomeSections");
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
    expect(card).toContain("formatHoursLabel");
    expect(card).toContain("Đang mở");
  });

  it("styles hours badge in CSS", () => {
    const css = projectFile("app/globals.css");

    expect(css).toContain(".restaurant-hours-badge");
  });
});
