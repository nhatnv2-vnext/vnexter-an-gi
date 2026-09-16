import type { WeatherCondition } from "./types";

/** WMO weather codes that mean rain / storm / drizzle */
const RAIN_CODES = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
]);

export function classifyWeather(tempC: number, weatherCode: number): WeatherCondition {
  if (RAIN_CODES.has(weatherCode)) return "rain";
  if (tempC >= 33) return "hot";
  if (tempC <= 20) return "cold";
  return "mild";
}

/** Human-readable Vietnamese label from WMO weather code */
export function describeWeatherCode(weatherCode: number): string {
  if (weatherCode === 0) return "Trời quang";
  if (weatherCode === 1 || weatherCode === 2) return "Ít mây";
  if (weatherCode === 3) return "Nhiều mây";
  if (weatherCode === 45 || weatherCode === 48) return "Có sương mù";
  if (weatherCode >= 51 && weatherCode <= 57) return "Mưa phùn";
  if (weatherCode === 61 || weatherCode === 80) return "Mưa nhẹ";
  if (weatherCode === 63 || weatherCode === 81) return "Mưa vừa";
  if (weatherCode === 65 || weatherCode === 82) return "Mưa to";
  if (weatherCode === 66 || weatherCode === 67) return "Mưa đá lạnh";
  if (weatherCode >= 71 && weatherCode <= 77) return "Có tuyết";
  if (weatherCode === 95) return "Giông";
  if (weatherCode === 96 || weatherCode === 99) return "Giông kèm mưa đá";
  if (RAIN_CODES.has(weatherCode)) return "Trời mưa";
  return "Trời dịu";
}

export const CONDITION_LABELS: Record<WeatherCondition, string> = {
  rain: "Trời mưa",
  hot: "Nắng nóng",
  cold: "Se lạnh",
  mild: "Dễ chịu",
};

export type WeatherIconKind =
  | "sun"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "storm"
  | "snow"
  | "unknown";

/** Map WMO weather code → weather-app style icon */
export function weatherIconFromCode(weatherCode: number): WeatherIconKind {
  if (weatherCode === 0) return "sun";
  if (weatherCode === 1 || weatherCode === 2) return "partly-cloudy";
  if (weatherCode === 3) return "cloudy";
  if (weatherCode === 45 || weatherCode === 48) return "fog";
  if (weatherCode >= 51 && weatherCode <= 57) return "drizzle";
  if (weatherCode >= 71 && weatherCode <= 77) return "snow";
  if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) return "storm";
  if (
    weatherCode === 61 ||
    weatherCode === 63 ||
    weatherCode === 65 ||
    weatherCode === 66 ||
    weatherCode === 67 ||
    weatherCode === 80 ||
    weatherCode === 81 ||
    weatherCode === 82
  ) {
    return "rain";
  }
  if (RAIN_CODES.has(weatherCode)) return "rain";
  return "unknown";
}


const SUGGESTION_COPY: Record<
  WeatherCondition,
  { text: string; preferredTags: string[] }
> = {
  rain: {
    text: "Trưa mưa quanh Trung Kính — nên ăn món nóng như phở hoặc bún cho ấm bụng.",
    preferredTags: ["pho", "nong", "bun"],
  },
  hot: {
    text: "Trưa nắng nóng — nên tìm quán có điều hòa hoặc ngồi trong nhà.",
    preferredTags: ["dieuhoa", "trongnha", "mat"],
  },
  cold: {
    text: "Trưa se lạnh — hợp món nóng như phở hoặc bún quanh Trung Kính.",
    preferredTags: ["nong", "pho", "bun"],
  },
  mild: {
    text: "Thời tiết dễ chịu — hợp đi bộ ăn trưa quanh 219 Trung Kính.",
    preferredTags: ["trua"],
  },
};

/**
 * Score a restaurant based on how well its tags match the preferred tags.
 * Higher scores mean better matches. Uses weighted scoring where tags
 * earlier in preferredTags have higher weight.
 */
function scoreRestaurant(
  restaurantTags: string[],
  preferredTags: string[],
): number {
  let score = 0;
  for (let i = 0; i < preferredTags.length; i++) {
    const weight = preferredTags.length - i;
    if (restaurantTags.includes(preferredTags[i])) {
      score += weight;
    }
  }
  return score;
}

export function buildLunchSuggestion(
  condition: WeatherCondition,
  restaurants: { id: string; name: string; tags: string[] }[],
): {
  suggestionText: string;
  suggestedRestaurantId?: string;
  preferredTags: string[];
} {
  const { text, preferredTags } = SUGGESTION_COPY[condition];

  const scored = restaurants
    .map((r) => ({
      ...r,
      score: scoreRestaurant(r.tags, preferredTags),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const bestMatch = scored[0];

  if (bestMatch) {
    const suggestionText = `${text} Gợi ý hôm nay: ${bestMatch.name}.`;
    return {
      suggestionText,
      preferredTags,
      suggestedRestaurantId: bestMatch.id,
    };
  }

  return {
    suggestionText: text,
    preferredTags,
    suggestedRestaurantId: undefined,
  };
}

export const TRUNG_KINH_COORDS = { latitude: 21.0139, longitude: 105.7965 };

export const DEFAULT_LUNCH_FALLBACK =
  "Không lấy được thời tiết. Gợi ý mặc định cho bữa trưa: bún bò Huế quanh 219 Trung Kính.";

export async function fetchOpenMeteoCurrent(): Promise<{
  tempC: number;
  weatherCode: number;
}> {
  const { latitude, longitude } = TRUNG_KINH_COORDS;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("timezone", "Asia/Ho_Chi_Minh");

  const res = await fetch(url.toString(), { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
  };
  const tempC = data.current?.temperature_2m;
  const weatherCode = data.current?.weather_code;
  if (typeof tempC !== "number" || typeof weatherCode !== "number") {
    throw new Error("Open-Meteo payload missing current weather");
  }
  return { tempC, weatherCode };
}

export type LunchWeatherPayload = {
  condition: WeatherCondition;
  conditionLabel: string;
  skyLabel: string;
  icon: WeatherIconKind;
  tempC: number | null;
  weatherCode: number | null;
  suggestionText: string;
  suggestedRestaurantId?: string;
  degraded?: boolean;
};

export async function getLunchWeather(
  restaurants: { id: string; name: string; tags: string[] }[],
): Promise<LunchWeatherPayload> {
  try {
    const { tempC, weatherCode } = await fetchOpenMeteoCurrent();
    const condition = classifyWeather(tempC, weatherCode);
    const suggestion = buildLunchSuggestion(condition, restaurants);
    return {
      condition,
      conditionLabel: CONDITION_LABELS[condition],
      skyLabel: describeWeatherCode(weatherCode),
      icon: weatherIconFromCode(weatherCode),
      tempC,
      weatherCode,
      suggestionText: suggestion.suggestionText,
      suggestedRestaurantId: suggestion.suggestedRestaurantId,
    };
  } catch {
    const fallbackRestaurant = restaurants.find(
      (r) => r.tags.includes("bun") || r.tags.includes("nong"),
    );
    const suggestionText = fallbackRestaurant
      ? `${DEFAULT_LUNCH_FALLBACK} Gợi ý hôm nay: ${fallbackRestaurant.name}.`
      : DEFAULT_LUNCH_FALLBACK;

    return {
      condition: "mild",
      conditionLabel: CONDITION_LABELS.mild,
      skyLabel: "Chưa lấy được trời",
      icon: "unknown",
      tempC: null,
      weatherCode: null,
      suggestionText,
      suggestedRestaurantId: fallbackRestaurant?.id,
      degraded: true,
    };
  }
}
