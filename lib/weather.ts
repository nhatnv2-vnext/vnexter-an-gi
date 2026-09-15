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
    text: "Trưa mưa quanh Trung Kính — nên ăn bún bò Huế hoặc bún cá cay cho ấm bụng.",
    preferredTags: ["bun", "nong"],
  },
  hot: {
    text: "Trưa nắng nóng — vẫn có thể chọn bún cay vừa miệng gần 219 Trung Kính.",
    preferredTags: ["bun", "trua"],
  },
  cold: {
    text: "Trưa se lạnh — hợp món nóng như bún bò Huế hoặc bún cá cay.",
    preferredTags: ["nong", "bun"],
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
