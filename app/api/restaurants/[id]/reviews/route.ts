import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateCreateReview } from "@/lib/review-validation";
import { ensureVisitorId, VISITOR_COOKIE } from "@/lib/visitor";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) {
    return NextResponse.json({ error: "Không tìm thấy quán" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const validated = validateCreateReview(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const existingCookie = req.cookies.get(VISITOR_COOKIE)?.value;
  const { visitorId, setCookie } = ensureVisitorId(existingCookie);

  try {
    const review = await prisma.review.create({
      data: {
        restaurantId: id,
        visitorId,
        rating: validated.data.rating,
        comment: validated.data.comment,
        authorName: validated.data.authorName,
      },
    });

    const res = NextResponse.json({ review }, { status: 201 });
    if (setCookie) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "Bạn đã đánh giá quán này rồi" },
        { status: 409 },
      );
    }
    throw e;
  }
}
