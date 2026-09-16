import Image from "next/image";
import Link from "next/link";

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
};

export function RestaurantCard({
  restaurant,
  index,
}: {
  restaurant: RestaurantListItem;
  index: number;
}) {
  const rating =
    restaurant.reviewCount > 0
      ? `${restaurant.avgRating.toFixed(1)} / 5 · ${restaurant.reviewCount} đánh giá`
      : "Chưa có đánh giá";

  const hoursLabel = restaurant.closeTime
    ? `Mở đến ${restaurant.closeTime}`
    : null;

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
        />
      </Link>
      <div className="restaurant-copy">
        <p className="restaurant-rating">
          <span aria-hidden="true">★</span> {rating}
          {hoursLabel && (
            <span className="restaurant-hours-badge">{hoursLabel}</span>
          )}
        </p>
        <h3>
          <Link href={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
        </h3>
        <p>{restaurant.description}</p>
        <span className="restaurant-address">{restaurant.address}</span>
      </div>
      <Link className="restaurant-arrow" href={`/restaurants/${restaurant.id}`}>
        <span className="sr-only">Xem chi tiết {restaurant.name}</span>
        <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
