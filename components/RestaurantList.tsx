import {
  RestaurantCard,
  type RestaurantListItem,
} from "@/components/RestaurantCard";

export function RestaurantList({
  restaurants,
}: {
  restaurants: RestaurantListItem[];
}) {
  return (
    <section className="restaurants-section section-shell" aria-labelledby="restaurants-heading">
      <div className="section-label">03 — Đi ăn thôi</div>
      <div className="restaurants-heading">
        <h2 id="restaurants-heading">Quán ăn trưa quanh đây</h2>
        <p>
          Những địa chỉ gần 219 Trung Kính, đủ gần để đi ăn trưa mà không cần
          vội.
        </p>
      </div>
      <div className="restaurant-list">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
