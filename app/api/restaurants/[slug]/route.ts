import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VISITOR_COOKIE } from "@/lib/visitor";

type Params = { params: Promise<{ slug: string }> };

function looksLikeCuid(value: string): boolean {
  return /^c[a-z0-9]{24}$/i.test(value);
}

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const visitorId = req.cookies.get(VISITOR_COOKIE)?.value;

  const where = looksLikeCuid(slug) ? { id: slug } : { slug };

  const restaurant = await prisma.restaurant.findUnique({
    where,
    include: {
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Không tìm thấy quán" }, { status: 404 });
  }

  const reviewCount = restaurant.reviews.length;
  const avgRating =
    reviewCount === 0
      ? 0
      : restaurant.reviews.reduce((s, x) => s + x.rating, 0) / reviewCount;

  const myReview = visitorId
    ? restaurant.reviews.find((r) => r.visitorId === visitorId) ?? null
    : null;

  return NextResponse.json({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      address: restaurant.address,
      imageUrl: restaurant.imageUrl,
      tags: restaurant.tags,
      createdAt: restaurant.createdAt,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
      reviews: restaurant.reviews.map(({ visitorId: _v, ...r }) => r),
      myReview: myReview
        ? {
            id: myReview.id,
            rating: myReview.rating,
            comment: myReview.comment,
            authorName: myReview.authorName,
            createdAt: myReview.createdAt,
          }
        : null,
    },
  });
}
