"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WeatherPayload = {
  condition: "rain" | "hot" | "cold" | "mild";
  tempC: number | null;
  suggestionText: string;
  suggestedRestaurantId?: string;
  degraded?: boolean;
};

const conditionLabels: Record<WeatherPayload["condition"], string> = {
  rain: "Trời mưa",
  hot: "Nắng nóng",
  cold: "Se lạnh",
  mild: "Dễ chịu",
};

export function WeatherSuggestion() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      try {
        const response = await fetch("/api/weather", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Weather request failed");
        setWeather((await response.json()) as WeatherPayload);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setFailed(true);
      }
    }

    void loadWeather();
    return () => controller.abort();
  }, []);

  return (
    <section className="weather-section section-shell" aria-labelledby="weather-heading">
      <div className="section-label">02 — Ngó trời</div>
      <div className="weather-layout">
        <div className="weather-mark" aria-hidden="true">
          <span />
        </div>
        <div className="weather-content">
          <p className="weather-status">
            {weather
              ? `${conditionLabels[weather.condition]}${
                  weather.tempC === null ? "" : ` · ${Math.round(weather.tempC)}°C`
                }`
              : failed
                ? "Chưa đọc được thời tiết"
                : "Đang xem thời tiết Trung Kính..."}
          </p>
          <h2 id="weather-heading">Gợi ý ăn trưa theo trời</h2>
          <p className="weather-suggestion">
            {weather?.suggestionText ??
              (failed
                ? "Cứ chọn một món nóng, dễ ăn cho bữa trưa quanh Trung Kính."
                : "Một chút kiên nhẫn, gợi ý món trưa đang tới.")}
          </p>
          {weather?.degraded && (
            <p className="weather-note">Gợi ý dự phòng khi dữ liệu thời tiết gián đoạn.</p>
          )}
          {weather?.suggestedRestaurantId && (
            <Link href={`/restaurants/${weather.suggestedRestaurantId}`}>
              Xem quán hợp thời tiết <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
