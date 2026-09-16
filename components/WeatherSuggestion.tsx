"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WeatherIcon } from "@/components/WeatherIcon";
import type { WeatherIconKind } from "@/lib/weather";

type WeatherPayload = {
  condition: "rain" | "hot" | "cold" | "mild";
  conditionLabel?: string;
  skyLabel?: string;
  icon?: WeatherIconKind;
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

function iconFromCondition(
  condition: WeatherPayload["condition"],
): WeatherIconKind {
  if (condition === "rain") return "rain";
  if (condition === "hot") return "sun";
  if (condition === "cold") return "cloudy";
  return "partly-cloudy";
}

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

  const skyLabel =
    weather?.skyLabel ??
    (weather ? conditionLabels[weather.condition] : null);
  const conditionLabel =
    weather?.conditionLabel ??
    (weather ? conditionLabels[weather.condition] : null);
  const tempDisplay =
    weather?.tempC === null || weather?.tempC === undefined
      ? null
      : Math.round(weather.tempC);
  const iconKind =
    weather?.icon ??
    (weather ? iconFromCondition(weather.condition) : "unknown");

  return (
    <section className="weather-section" aria-labelledby="weather-heading">
      <div className="weather-section-inner">
        <div className="section-label">02 — Thời tiết hôm nay</div>
        <div className="weather-layout">
        <div
          className={`weather-card is-${weather?.condition ?? "loading"} is-icon-${iconKind}`}
          aria-live="polite"
        >
          <div className="weather-card-icon" aria-hidden="true">
            {weather || failed ? (
              <WeatherIcon kind={failed && !weather ? "unknown" : iconKind} />
            ) : (
              <span className="weather-card-loading" />
            )}
          </div>
          <div className="weather-card-meta">
            <p className="weather-card-place">Trung Kính · Hà Nội</p>
            {tempDisplay !== null ? (
              <p className="weather-card-temp">
                <strong>{tempDisplay}</strong>
                <span>°C</span>
              </p>
            ) : (
              <p className="weather-card-temp is-muted">
                {failed ? "--" : "..."}
                <span>°C</span>
              </p>
            )}
            <p className="weather-card-sky">
              {weather
                ? skyLabel
                : failed
                  ? "Chưa đọc được trời"
                  : "Đang cập nhật..."}
            </p>
          </div>
        </div>

        <div className="weather-content">
          <p className="weather-status">
            {weather
              ? [
                  skyLabel,
                  conditionLabel && conditionLabel !== skyLabel
                    ? conditionLabel
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : failed
                ? "Chưa đọc được thời tiết"
                : "Đang xem thời tiết Trung Kính..."}
          </p>
          <h2 id="weather-heading">Gợi ý ăn trưa theo thời tiết</h2>
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
      </div>
    </section>
  );
}
