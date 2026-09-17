import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AddressMapLink } from "@/components/AddressMapLink";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import { StarRating } from "@/components/StarRating";
import { prisma } from "@/lib/prisma";
import { formatHoursLabel, isOpenNow } from "@/lib/restaurant-hours";
import { getTagLabel } from "@/lib/restaurant-tags";
import { VISITOR_COOKIE } from "@/lib/visitor";

type RestaurantPageProps = {
  params: Promise<{ slug: string }>;
};

function looksLikeCuid(value: string): boolean {
  return /^c[a-z0-9]{24}$/i.test(value);
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const where = looksLikeCuid(slug) 
    ? { id: slug }
    : { slug };
  
  const restaurant = await prisma.restaurant.findUnique({
    where,
    select: {
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      metaTitle: true,
      metaDescription: true,
      metaImageUrl: true,
    },
  });
  if (!restaurant) return { title: "Không tìm thấy quán" };

  const title = restaurant.metaTitle?.trim();
  const description = (
    restaurant.metaDescription?.trim() || restaurant.description
  ).slice(0, 180);
  const image = restaurant.metaImageUrl?.trim() || restaurant.imageUrl;

  return {
    title: title ? { absolute: title } : restaurant.name,
    description,
    alternates: {
      canonical: `/restaurants/${restaurant.slug}`,
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: `/restaurants/${restaurant.slug}`,
      siteName: "Vnexter ăn gì",
      title: title || `${restaurant.name} · Vnexter ăn gì`,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title || `${restaurant.name} · Vnexter ăn gì`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;
  const visitorId = (await cookies()).get(VISITOR_COOKIE)?.value;
  
  const isId = looksLikeCuid(slug);
  const where = isId ? { id: slug } : { slug };
  
  const restaurant = await prisma.restaurant.findUnique({
    where,
    include: { reviews: { orderBy: { createdAt: "desc" } } },
  });

  if (!restaurant) notFound();
  
  if (isId && restaurant.slug !== slug) {
    redirect(`/restaurants/${restaurant.slug}`, "replace");
  }

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

  const priceLabel =
    restaurant.priceMin && restaurant.priceMax
      ? `${(restaurant.priceMin / 1000).toFixed(0)}–${(restaurant.priceMax / 1000).toFixed(0)}k`
      : restaurant.priceMin
        ? `Từ ${(restaurant.priceMin / 1000).toFixed(0)}k`
        : restaurant.priceMax
          ? `Đến ${(restaurant.priceMax / 1000).toFixed(0)}k`
          : null;

  const hoursLabel = formatHoursLabel(restaurant.openTime, restaurant.closeTime);
  const openStatus = isOpenNow(restaurant.openTime, restaurant.closeTime);

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
            <AddressMapLink
              className="detail-address"
              address={restaurant.address}
            />
            {hoursLabel && (
              <p className="detail-hours">
                <span aria-hidden="true">🕒</span> {hoursLabel}
                {openStatus === true
                  ? " · Đang mở"
                  : openStatus === false
                    ? " · Đã đóng"
                    : ""}
              </p>
            )}
            {priceLabel && (
              <p className="detail-price">
                <span aria-hidden="true">💰</span> {priceLabel}
              </p>
            )}
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
              {Array.from(new Set(restaurant.tags)).map((tag) => (
                <span key={tag}>{getTagLabel(tag)}</span>
              ))}
            </div>
          </div>
          <div className="detail-image">
            <Image
              src={restaurant.imageUrl}
              alt={`Món ăn tại ${restaurant.name}`}
              fill
              priority
              sizes="(max-width: 760px) 100vw, (max-width: 1100px) 90vw, 42vw"
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
