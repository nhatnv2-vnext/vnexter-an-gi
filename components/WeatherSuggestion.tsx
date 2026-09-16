import Link from "next/link";
import { WeatherIcon } from "@/components/WeatherIcon";
import type { LunchWeatherPayload, WeatherIconKind } from "@/lib/weather";

const conditionLabels: Record<LunchWeatherPayload["condition"], string> = {
  rain: "Trời mưa",
  hot: "Nắng nóng",
  cold: "Se lạnh",
  mild: "Dễ chịu",
};

function iconFromCondition(
  condition: LunchWeatherPayload["condition"],
): WeatherIconKind {
  if (condition === "rain") return "rain";
  if (condition === "hot") return "sun";
  if (condition === "cold") return "cloudy";
  return "partly-cloudy";
}

export function WeatherSuggestion({
  weather,
}: {
  weather: LunchWeatherPayload;
}) {
  const skyLabel = weather.skyLabel || conditionLabels[weather.condition];
  const conditionLabel =
    weather.conditionLabel || conditionLabels[weather.condition];
  const tempDisplay =
    weather.tempC === null || weather.tempC === undefined
      ? null
      : Math.round(weather.tempC);
  const iconKind = weather.icon || iconFromCondition(weather.condition);
  const failed = Boolean(weather.degraded && weather.tempC === null);

  return (
    <section className="weather-section" aria-labelledby="weather-heading">
      <div className="weather-section-inner">
        <div className="weather-layout">
          <div
            className={`weather-card is-${weather.condition} is-icon-${iconKind}`}
            aria-live="polite"
          >
            <div className="weather-card-icon" aria-hidden="true">
              <WeatherIcon kind={failed ? "unknown" : iconKind} />
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
                  --
                  <span>°C</span>
                </p>
              )}
              <p className="weather-card-sky">{skyLabel}</p>
            </div>
          </div>

          <div className="weather-content">
            <p className="weather-status">
              {[
                skyLabel,
                conditionLabel && conditionLabel !== skyLabel
                  ? conditionLabel
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h2 id="weather-heading">Gợi ý ăn trưa theo thời tiết</h2>
            <p className="weather-suggestion">{weather.suggestionText}</p>
            {weather.degraded && (
              <p className="weather-note">
                Gợi ý dự phòng khi dữ liệu thời tiết gián đoạn.
              </p>
            )}
            {weather.suggestedRestaurantId && (
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
