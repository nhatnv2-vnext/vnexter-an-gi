import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { validateRestaurantInput } from "@/lib/restaurant-admin";

type Params = { params: Promise<{ slug: string }> };

function looksLikeCuid(value: string): boolean {
  return /^c[a-z0-9]{24}$/i.test(value);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const where = looksLikeCuid(slug) ? { id: slug } : { slug };
  const body = await req.json().catch(() => null);
  const validated = validateRestaurantInput(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const restaurant = await prisma.restaurant.update({
      where,
      data: validated.data,
    });
    return NextResponse.json({ restaurant });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json({ error: "Không tìm thấy quán" }, { status: 404 });
      }
      if (e.code === "P2002") {
        return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
      }
    }
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const where = looksLikeCuid(slug) ? { id: slug } : { slug };
  try {
    await prisma.restaurant.delete({ where });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy quán" }, { status: 404 });
    }
    throw e;
  }
}
