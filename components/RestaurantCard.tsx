import Image from "next/image";
import Link from "next/link";
import { AddressMapLink } from "@/components/AddressMapLink";
import { formatHoursLabel, isOpenNow } from "@/lib/restaurant-hours";

export type RestaurantListItem = {
  id: string;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  avgRating: number;
  reviewCount: number;
  openTime?: string | null;
  closeTime?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  tags?: string[];
};

function formatPriceLabel(
  priceMin?: number | null,
  priceMax?: number | null,
): string | null {
  if (priceMin && priceMax) {
    return `${(priceMin / 1000).toFixed(0)}–${(priceMax / 1000).toFixed(0)}k`;
  }
  if (priceMin) return `Từ ${(priceMin / 1000).toFixed(0)}k`;
  if (priceMax) return `Đến ${(priceMax / 1000).toFixed(0)}k`;
  return null;
}

export function RestaurantCard({
  restaurant,
  index,
  priority = false,
}: {
  restaurant: RestaurantListItem;
  index: number;
  priority?: boolean;
}) {
  const ratingFull =
    restaurant.reviewCount > 0
      ? `${restaurant.avgRating.toFixed(1)} / 5 · ${restaurant.reviewCount} đánh giá`
      : "Chưa có đánh giá";

  const ratingCompact =
    restaurant.reviewCount > 0
      ? `${restaurant.avgRating.toFixed(1)} · ${restaurant.reviewCount}`
      : "Mới";

  const openStatus = isOpenNow(restaurant.openTime, restaurant.closeTime);
  const hoursLabel = formatHoursLabel(restaurant.openTime, restaurant.closeTime);
  const priceLabel = formatPriceLabel(
    restaurant.priceMin,
    restaurant.priceMax,
  );

  return (
    <article className="restaurant-row">
      <span className="restaurant-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <Link
        className="restaurant-image"
        href={`/restaurants/${restaurant.id}`}
        aria-label={`Xem ${restaurant.name}`}
      >
        <Image
          src={restaurant.imageUrl}
          alt={`Món ăn trưa tại ${restaurant.name}`}
          fill
          sizes="(max-width: 760px) 46vw, (max-width: 1100px) 280px, 320px"
          priority={priority}
        />
      </Link>
      <div className="restaurant-copy">
        <div className="restaurant-meta">
          <p className="restaurant-rating">
            <span aria-hidden="true">★</span>{" "}
            <span className="restaurant-rating-full">{ratingFull}</span>
            <span className="restaurant-rating-compact">{ratingCompact}</span>
          </p>
          <div className="restaurant-badges">
            {openStatus === true && (
              <span className="restaurant-open-badge">Đang mở</span>
            )}
            {openStatus === false && (
              <span className="restaurant-closed-badge">Đã đóng</span>
            )}
            {hoursLabel && (
              <span className="restaurant-hours-badge">{hoursLabel}</span>
            )}
            {priceLabel && (
              <span className="restaurant-price-badge">{priceLabel}</span>
            )}
          </div>
        </div>
        <h3>
          <Link href={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
        </h3>
        <p>{restaurant.description}</p>
        <AddressMapLink
          className="restaurant-address"
          address={restaurant.address}
        />
      </div>
      <Link className="restaurant-arrow" href={`/restaurants/${restaurant.id}`}>
        <span className="sr-only">Xem chi tiết {restaurant.name}</span>
        <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
