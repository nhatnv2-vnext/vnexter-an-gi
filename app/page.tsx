import { Hero } from "@/components/Hero";
import { RestaurantList } from "@/components/RestaurantList";
import { SpinnerSection } from "@/components/SpinnerSection";
import { WeatherSuggestion } from "@/components/WeatherSuggestion";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await prisma.restaurant.findMany({
    orderBy: { createdAt: "asc" },
    include: { reviews: { select: { rating: true } } },
  });

  const restaurants = rows.map(({ reviews, ...restaurant }) => {
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount === 0
        ? 0
        : reviews.reduce((total, review) => total + review.rating, 0) /
          reviewCount;

    return {
      ...restaurant,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
    };
  });

  return (
    <main>
      <Hero />
      <div className="home-sections">
        <SpinnerSection
          restaurants={restaurants.map(({ id, name, imageUrl, tags, priceMin, priceMax }) => ({
            id,
            name,
            imageUrl,
            tags,
            priceMin,
            priceMax,
          }))}
        />
        <WeatherSuggestion />
        <RestaurantList restaurants={restaurants} />
      </div>
    </main>
  );
}
