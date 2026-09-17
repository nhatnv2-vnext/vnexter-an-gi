import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl =
  process.env.AUTH_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://vnexter-an-gi.vercel.app");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const restaurants = await prisma.restaurant.findMany({
    select: { slug: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...restaurants.map((restaurant) => ({
      url: `${siteUrl}/restaurants/${restaurant.slug}`,
      lastModified: restaurant.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
