import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { updatedAt: "desc" },
    include: { reviews: { select: { rating: true } } },
  });

  const payload = restaurants.map((r) => {
    const reviewCount = r.reviews.length;
    const avgRating =
      reviewCount === 0
        ? 0
        : r.reviews.reduce((s, x) => s + x.rating, 0) / reviewCount;
    const { reviews: _reviews, ...rest } = r;
    return {
      ...rest,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
    };
  });

  return NextResponse.json({ restaurants: payload });
}
