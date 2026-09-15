import { describe, it, expect } from "vitest";
import { validateCreateReview } from "@/lib/review-validation";

describe("validateCreateReview", () => {
  it("accepts rating 1-5 with optional fields", () => {
    const result = validateCreateReview({
      rating: 5,
      comment: "Ngon",
      authorName: "An",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.rating).toBe(5);
      expect(result.data.comment).toBe("Ngon");
      expect(result.data.authorName).toBe("An");
    }
  });

  it("allows empty comment when rating present", () => {
    const result = validateCreateReview({ rating: 3 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.rating).toBe(3);
      expect(result.data.comment).toBeUndefined();
    }
  });

  it("caps comments at 500 characters", () => {
    const result = validateCreateReview({
      rating: 4,
      comment: "a".repeat(501),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.comment).toBe("a".repeat(500));
    }
  });

  it("rejects missing rating", () => {
    const result = validateCreateReview({ comment: "hi" });
    expect(result.ok).toBe(false);
  });

  it("rejects rating out of range", () => {
    expect(validateCreateReview({ rating: 0 }).ok).toBe(false);
    expect(validateCreateReview({ rating: 6 }).ok).toBe(false);
  });
});
