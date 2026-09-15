"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/StarRating";

export type MyReview = {
  id?: string;
  rating: number;
  comment: string | null;
  authorName: string | null;
};

export function ReviewForm({
  restaurantId,
  initialMyReview,
}: {
  restaurantId: string;
  initialMyReview: MyReview | null;
}) {
  const router = useRouter();
  const [myReview, setMyReview] = useState(initialMyReview);
  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0 || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, authorName, comment }),
      });

      if (response.status === 409) {
        setMyReview({
          rating,
          authorName: authorName.trim() || null,
          comment: comment.trim() || null,
        });
        router.refresh();
        return;
      }

      const body = (await response.json()) as {
        review?: MyReview;
        error?: string;
      };

      if (!response.ok || !body.review) {
        setError(body.error || "Chưa thể gửi đánh giá. Vui lòng thử lại.");
        return;
      }

      setMyReview(body.review);
      router.refresh();
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (myReview) {
    return (
      <section className="review-form review-locked" aria-labelledby="review-form-heading">
        <p className="section-label">Đánh giá của bạn</p>
        <h2 id="review-form-heading">Bạn đã đánh giá</h2>
        <StarRating
          value={myReview.rating}
          readOnly
          label={`Bạn đã đánh giá ${myReview.rating} trên 5 sao`}
        />
        {myReview.authorName && <p className="review-author">{myReview.authorName}</p>}
        {myReview.comment && <p className="review-comment">{myReview.comment}</p>}
        <p className="review-lock-note">Cảm ơn bạn đã chia sẻ cảm nhận về quán.</p>
      </section>
    );
  }

  return (
    <section className="review-form" aria-labelledby="review-form-heading">
      <p className="section-label">Chia sẻ trải nghiệm</p>
      <h2 id="review-form-heading">Bạn thấy quán thế nào?</h2>
      <form onSubmit={submitReview}>
        <fieldset>
          <legend>Chọn số sao</legend>
          <StarRating value={rating} onChange={setRating} label="Chọn số sao đánh giá" />
        </fieldset>
        <label>
          Tên của bạn <span>(không bắt buộc)</span>
          <input
            name="authorName"
            maxLength={40}
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Ví dụ: Minh"
          />
        </label>
        <label>
          Cảm nhận <span>(không bắt buộc)</span>
          <textarea
            name="comment"
            rows={5}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Món nào ngon, phục vụ ra sao?"
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="review-submit" type="submit" disabled={rating === 0 || submitting}>
          <span>{submitting ? "Đang gửi..." : "Gửi đánh giá"}</span>
          <span aria-hidden="true">↗</span>
        </button>
      </form>
    </section>
  );
}
