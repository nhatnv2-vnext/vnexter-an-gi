import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("restaurant detail UI", () => {
  it("provides controlled and read-only star ratings", () => {
    const stars = projectFile("components/StarRating.tsx");

    expect(stars).toContain('"use client"');
    expect(stars).toContain("value: number");
    expect(stars).toContain("onChange?: (rating: number) => void");
    expect(stars).toContain("aria-label");
    expect(stars).toContain("disabled={readOnly}");
  });

  it("submits reviews and locks after success or a duplicate response", () => {
    const form = projectFile("components/ReviewForm.tsx");

    expect(form).toContain('"use client"');
    expect(form).toContain("initialMyReview");
    expect(form).toContain("Bạn đã đánh giá");
    expect(form).toContain("response.status === 409");
    expect(form).toContain("router.refresh()");
    expect(form).toContain("JSON.stringify");
  });

  it("renders review identity, rating, comment, and date", () => {
    const list = projectFile("components/ReviewList.tsx");

    expect(list).toContain('review.authorName || "Ẩn danh"');
    expect(list).toContain("<StarRating");
    expect(list).toContain("toLocaleDateString");
  });

  it("loads a restaurant and visitor review in a dynamic detail page", () => {
    const page = projectFile("app/restaurants/[id]/page.tsx");

    expect(page).toContain('from "next/image"');
    expect(page).toContain("await params");
    expect(page).toContain("await cookies()");
    expect(page).toContain("VISITOR_COOKIE");
    expect(page).toContain("notFound()");
    expect(page).toContain("<ReviewForm");
    expect(page).toContain("<ReviewList");
  });
});
