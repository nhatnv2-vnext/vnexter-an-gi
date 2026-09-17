import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLunchWeather } from "@/lib/weather";

export const revalidate = 600;

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, slug: true, name: true, tags: true },
  });
  const payload = await getLunchWeather(restaurants);
  return NextResponse.json(payload);
}
