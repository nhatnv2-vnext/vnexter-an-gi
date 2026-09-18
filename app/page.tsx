import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { getLunchWeather } from "@/lib/weather";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const siteUrl =
  process.env.AUTH_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://vnexter-an-gi.vercel.app");

export const metadata: Metadata = {
  title: {
    absolute: "Vnexter ăn gì — Quán trưa quanh 219 Trung Kính",
  },
  description:
    "Chọn nhanh quán ăn trưa quanh 219 Trung Kính, Cầu Giấy, Hà Nội. Quay random, lọc theo giá & loại món, gợi ý theo thời tiết.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Vnexter ăn gì — Quán trưa quanh 219 Trung Kính",
    description:
      "Chọn nhanh quán ăn trưa quanh 219 Trung Kính. Quay random, lọc giá & món, gợi ý theo thời tiết.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: "Vnexter ăn gì — chọn quán trưa quanh 219 Trung Kính",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vnexter ăn gì — Quán trưa quanh 219 Trung Kính",
    description:
      "Chọn nhanh quán ăn trưa quanh 219 Trung Kính. Quay random, lọc giá & món, gợi ý theo thời tiết.",
    images: [`${siteUrl}/og.png`],
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
        name: "Vnexter ăn gì",
        description:
          "Chọn nhanh quán ăn trưa quanh 219 Trung Kính, Cầu Giấy, Hà Nội",
        inLanguage: "vi-VN",
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
