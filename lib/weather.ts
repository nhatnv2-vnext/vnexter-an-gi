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

const SUGGESTION_COPY: Record<
  WeatherCondition,
  { text: string; preferredTags: string[] }
> = {
  rain: {
    text: "Trưa mưa quanh Trung Kính — nên ăn phở bò hoặc món nóng cho ấm bụng.",
    preferredTags: ["pho", "nong"],
  },
  hot: {
    text: "Trưa nắng nóng — chọn món mát, nhẹ bụng gần 219 Trung Kính.",
    preferredTags: ["mat", "do-uong"],
  },
  cold: {
    text: "Trưa se lạnh — hợp món nóng, phở hoặc lẩu nhẹ.",
    preferredTags: ["nong", "pho"],
  },
  mild: {
    text: "Thời tiết dễ chịu — hợp đi bộ ăn trưa quanh 219 Trung Kính.",
    preferredTags: ["trua"],
  },
};

export function buildLunchSuggestion(
  condition: WeatherCondition,
  restaurants: { id: string; tags: string[] }[],
): {
  suggestionText: string;
  suggestedRestaurantId?: string;
  preferredTags: string[];
} {
  const { text, preferredTags } = SUGGESTION_COPY[condition];
  const match = restaurants.find((r) =>
    r.tags.some((t) => preferredTags.includes(t)),
  );
  return {
    suggestionText: text,
    preferredTags,
    suggestedRestaurantId: match?.id,
  };
}

export const TRUNG_KINH_COORDS = { latitude: 21.0139, longitude: 105.7965 };

export const DEFAULT_LUNCH_FALLBACK =
  "Không lấy được thời tiết. Gợi ý mặc định cho bữa trưa: phở bò quanh 219 Trung Kính.";

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
