import type { CreateReviewInput } from "./types";

export function validateCreateReview(
  input: unknown,
): { ok: true; data: CreateReviewInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Payload không hợp lệ" };
  }
  const body = input as Record<string, unknown>;
  const rating = body.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating phải là số nguyên từ 1 đến 5" };
  }

  const data: CreateReviewInput = { rating };

  if (body.comment !== undefined && body.comment !== null && body.comment !== "") {
    if (typeof body.comment !== "string") {
      return { ok: false, error: "Comment không hợp lệ" };
    }
    data.comment = body.comment.trim().slice(0, 500);
  }

  if (body.authorName !== undefined && body.authorName !== null && body.authorName !== "") {
    if (typeof body.authorName !== "string") {
      return { ok: false, error: "Tên không hợp lệ" };
    }
    data.authorName = body.authorName.trim().slice(0, 40);
  }

  return { ok: true, data };
}
