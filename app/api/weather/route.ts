import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildLunchSuggestion,
  classifyWeather,
  CONDITION_LABELS,
  DEFAULT_LUNCH_FALLBACK,
  describeWeatherCode,
  fetchOpenMeteoCurrent,
  weatherIconFromCode,
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
      conditionLabel: CONDITION_LABELS[condition],
      skyLabel: describeWeatherCode(weatherCode),
      icon: weatherIconFromCode(weatherCode),
      tempC,
      weatherCode,
      suggestionText: suggestion.suggestionText,
      suggestedRestaurantId: suggestion.suggestedRestaurantId,
    });
  } catch {
    return NextResponse.json({
      condition: "mild",
      conditionLabel: CONDITION_LABELS.mild,
      skyLabel: "Chưa lấy được trời",
      icon: "unknown",
      tempC: null,
      weatherCode: null,
      suggestionText: DEFAULT_LUNCH_FALLBACK,
      suggestedRestaurantId: restaurants.find((r) =>
        r.tags.includes("bun") || r.tags.includes("nong"),
      )?.id,
      degraded: true,
    });
  }
}
