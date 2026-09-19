import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntry = {
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 1,
  };

  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set, returning minimal sitemap");
    return [baseEntry];
  }

  try {
    const restaurants = await prisma.restaurant.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "asc" },
    });

    const restaurantEntries = restaurants.map((restaurant) => ({
      url: `${siteUrl}/restaurants/${restaurant.slug}`,
      lastModified: restaurant.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

    return [baseEntry, ...restaurantEntries];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [baseEntry];
  }
}
