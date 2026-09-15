import { StarRating } from "@/components/StarRating";

export type ReviewListItem = {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string | null;
  createdAt: Date | string;
};

export function ReviewList({ reviews }: { reviews: ReviewListItem[] }) {
  return (
    <section className="reviews-section" aria-labelledby="reviews-heading">
      <div className="reviews-heading">
        <div>
          <p className="section-label">Mọi người nói gì</p>
          <h2 id="reviews-heading">Đánh giá gần đây</h2>
        </div>
        <span>{reviews.length} lượt chia sẻ</span>
      </div>

      {reviews.length === 0 ? (
        <p className="reviews-empty">Chưa có đánh giá. Hãy là người đầu tiên chia sẻ.</p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <article className="review-item" key={review.id}>
              <div className="review-meta">
                <strong>{review.authorName || "Ẩn danh"}</strong>
                <time dateTime={new Date(review.createdAt).toISOString()}>
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </time>
              </div>
              <StarRating
                value={review.rating}
                readOnly
                label={`${review.rating} trên 5 sao`}
              />
              {review.comment && <p>{review.comment}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
