import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { getSiteUrl, SITE_BRAND, SITE_BRAND_ASCII } from "@/lib/site";
import { getLunchWeather } from "@/lib/weather";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const siteUrl = getSiteUrl();
const homeTitle = `${SITE_BRAND} — Quán trưa quanh 219 Trung Kính`;
const homeDescription =
  "Chọn nhanh quán ăn trưa quanh 219 Trung Kính, Cầu Giấy, Hà Nội. Quay random, lọc theo giá & loại món, gợi ý theo thời tiết.";

export const metadata: Metadata = {
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  keywords: [
    SITE_BRAND,
    SITE_BRAND_ASCII,
    "vnexter",
    "ăn gì",
    "ăn trưa Trung Kính",
    "quán trưa 219 Trung Kính",
    "Cầu Giấy",
    "Hà Nội",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: SITE_BRAND,
    title: homeTitle,
    description:
      "Chọn nhanh quán ăn trưa quanh 219 Trung Kính. Quay random, lọc giá & món, gợi ý theo thời tiết.",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE_BRAND} — chọn quán trưa quanh 219 Trung Kính`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description:
      "Chọn nhanh quán ăn trưa quanh 219 Trung Kính. Quay random, lọc giá & món, gợi ý theo thời tiết.",
    images: ["/og.png"],
  },
};

export default async function Home() {
  const rows = await prisma.restaurant.findMany({
    orderBy: { updatedAt: "desc" },
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

  const weather = await getLunchWeather(
    restaurants.map(({ id, slug, name, tags }) => ({ id, slug, name, tags })),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_BRAND,
        alternateName: [SITE_BRAND_ASCII, "Vnexter"],
        description: homeDescription,
        inLanguage: "vi-VN",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Vnexter",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/favicon.webp`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: homeTitle,
        description: homeDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        inLanguage: "vi-VN",
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#restaurant-list`,
        name: "Quán ăn trưa quanh 219 Trung Kính",
        numberOfItems: restaurants.length,
        itemListElement: restaurants.map((restaurant, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: restaurant.name,
          url: `${siteUrl}/restaurants/${restaurant.slug}`,
        })),
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <div className="home-sections">
        <HomeSections restaurants={restaurants} weather={weather} />
      </div>
      <SiteFooter />
    </main>
  );
}
