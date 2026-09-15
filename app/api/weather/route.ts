import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildLunchSuggestion,
  classifyWeather,
  DEFAULT_LUNCH_FALLBACK,
  fetchOpenMeteoCurrent,
} from "@/lib/weather";

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, tags: true },
  });

  try {
    const { tempC, weatherCode } = await fetchOpenMeteoCurrent();
    const condition = classifyWeather(tempC, weatherCode);
    const suggestion = buildLunchSuggestion(condition, restaurants);
    return NextResponse.json({
      condition,
      tempC,
      suggestionText: suggestion.suggestionText,
      suggestedRestaurantId: suggestion.suggestedRestaurantId,
    });
  } catch {
    return NextResponse.json({
      condition: "mild",
      tempC: null,
      suggestionText: DEFAULT_LUNCH_FALLBACK,
      suggestedRestaurantId: restaurants.find((r) =>
        r.tags.includes("pho"),
      )?.id,
      degraded: true,
    });
  }
}
