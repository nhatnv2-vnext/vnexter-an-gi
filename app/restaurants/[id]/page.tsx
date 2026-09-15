import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import { StarRating } from "@/components/StarRating";
import { prisma } from "@/lib/prisma";
import { VISITOR_COOKIE } from "@/lib/visitor";

type RestaurantPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { id } = await params;
  const visitorId = (await cookies()).get(VISITOR_COOKIE)?.value;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: { reviews: { orderBy: { createdAt: "desc" } } },
  });

  if (!restaurant) notFound();

  const reviewCount = restaurant.reviews.length;
  const avgRating =
    reviewCount === 0
      ? 0
      : Math.round(
          (restaurant.reviews.reduce((total, review) => total + review.rating, 0) /
            reviewCount) *
            10,
        ) / 10;
  const myReview = visitorId
    ? restaurant.reviews.find((review) => review.visitorId === visitorId) ?? null
    : null;

  return (
    <main className="detail-page">
      <header className="detail-hero">
        <div className="detail-nav">
          <Link href="/">
            <span aria-hidden="true">←</span> Quay lại chọn quán
          </Link>
        </div>
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <p className="section-label">Quán trưa quanh Trung Kính</p>
            <h1>{restaurant.name}</h1>
            <p className="detail-description">{restaurant.description}</p>
            <p className="detail-address">
              <span aria-hidden="true">⌖</span> {restaurant.address}
            </p>
            <div className="detail-rating-summary">
              <StarRating
                value={Math.round(avgRating)}
                readOnly
                label={
                  reviewCount > 0
                    ? `Điểm trung bình ${avgRating} trên 5 sao`
                    : "Chưa có đánh giá"
                }
              />
              <strong>{reviewCount > 0 ? avgRating.toFixed(1) : "Mới"}</strong>
              <span>
                {reviewCount > 0 ? `${reviewCount} đánh giá` : "Chưa có đánh giá"}
              </span>
            </div>
            <div className="detail-tags" aria-label="Đặc điểm quán">
              {restaurant.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="detail-image">
            <Image
              src={restaurant.imageUrl}
              alt={`Món ăn tại ${restaurant.name}`}
              fill
              priority
              sizes="(max-width: 800px) 100vw, 48vw"
            />
          </div>
        </div>
      </header>

      <div className="detail-content">
        <ReviewForm
          restaurantId={restaurant.id}
          initialMyReview={
            myReview
              ? {
                  id: myReview.id,
                  rating: myReview.rating,
                  comment: myReview.comment,
                  authorName: myReview.authorName,
                }
              : null
          }
        />
        <ReviewList
          reviews={restaurant.reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            authorName: review.authorName,
            createdAt: review.createdAt,
          }))}
        />
      </div>
    </main>
  );
}
