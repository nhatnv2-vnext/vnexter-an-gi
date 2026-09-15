"use client";

type StarRatingProps = {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  label?: string;
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  label = "Đánh giá",
}: StarRatingProps) {
  return (
    <div className="star-rating" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={star <= value ? "star is-filled" : "star"}
          type="button"
          aria-label={`${star} sao`}
          aria-pressed={star === value}
          disabled={readOnly}
          onClick={() => onChange?.(star)}
        >
          <span aria-hidden="true">★</span>
        </button>
      ))}
    </div>
  );
}
