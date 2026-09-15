import type { WeatherIconKind } from "@/lib/weather";

type Props = {
  kind: WeatherIconKind;
  className?: string;
};

export function WeatherIcon({ kind, className }: Props) {
  const common = {
    className: className ?? "weather-icon-svg",
    viewBox: "0 0 64 64",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };

  switch (kind) {
    case "sun":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="12" fill="#ffb347" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 32 + Math.cos(rad) * 18;
            const y1 = 32 + Math.sin(rad) * 18;
            const x2 = 32 + Math.cos(rad) * 26;
            const y2 = 32 + Math.sin(rad) * 26;
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ff9a4d"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      );
    case "partly-cloudy":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="9" fill="#ffb347" />
          <path
            d="M22 42h22a9 9 0 0 0 0-18 11 11 0 0 0-21.2-3.2A8 8 0 0 0 22 42Z"
            fill="#d7dde8"
          />
          <path
            d="M22 42h22a9 9 0 0 0 0-18 11 11 0 0 0-21.2-3.2A8 8 0 0 0 22 42Z"
            fill="#fff"
            opacity="0.35"
          />
        </svg>
      );
    case "cloudy":
      return (
        <svg {...common}>
          <path
            d="M18 44h28a10 10 0 0 0 0-20 12.5 12.5 0 0 0-24-4.2A9 9 0 0 0 18 44Z"
            fill="#c5ccd8"
          />
          <path
            d="M14 48h26a8 8 0 0 0 0-16 10 10 0 0 0-19.2-3.4A7.5 7.5 0 0 0 14 48Z"
            fill="#e8ecf2"
            opacity="0.9"
          />
        </svg>
      );
    case "fog":
      return (
        <svg {...common}>
          <path
            d="M20 28h24a8 8 0 0 0 0-16 10 10 0 0 0-19.5-3.5A7 7 0 0 0 20 28Z"
            fill="#b8c0cc"
            opacity="0.85"
          />
          <line x1="14" y1="36" x2="50" y2="36" stroke="#9aa3b2" strokeWidth="3" strokeLinecap="round" />
          <line x1="18" y1="44" x2="46" y2="44" stroke="#9aa3b2" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="52" x2="48" y2="52" stroke="#9aa3b2" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "drizzle":
      return (
        <svg {...common}>
          <path
            d="M18 30h26a9 9 0 0 0 0-18 11 11 0 0 0-21.5-3.6A8 8 0 0 0 18 30Z"
            fill="#c5ccd8"
          />
          <path d="M24 38v8" stroke="#7eb6ff" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 40v8" stroke="#7eb6ff" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 38v8" stroke="#7eb6ff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "rain":
      return (
        <svg {...common}>
          <path
            d="M16 28h30a10 10 0 0 0 0-20 12 12 0 0 0-23.2-4A8.5 8.5 0 0 0 16 28Z"
            fill="#9aa5b5"
          />
          <path d="M22 36l-3 12" stroke="#5aa2ff" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M32 38l-3 14" stroke="#5aa2ff" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M42 36l-3 12" stroke="#5aa2ff" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      );
    case "storm":
      return (
        <svg {...common}>
          <path
            d="M15 26h31a10 10 0 0 0 0-20 12 12 0 0 0-23.5-4.2A8.5 8.5 0 0 0 15 26Z"
            fill="#6d7788"
          />
          <path
            d="M34 28 26 42h7l-3 12 12-16h-8l6-10Z"
            fill="#ffd36a"
          />
          <path d="M20 40l-2 8" stroke="#5aa2ff" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M44 42l-2 8" stroke="#5aa2ff" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case "snow":
      return (
        <svg {...common}>
          <path
            d="M18 30h26a9 9 0 0 0 0-18 11 11 0 0 0-21.5-3.6A8 8 0 0 0 18 30Z"
            fill="#d5dbe6"
          />
          <circle cx="24" cy="40" r="2.2" fill="#fff" />
          <circle cx="33" cy="44" r="2.2" fill="#fff" />
          <circle cx="42" cy="39" r="2.2" fill="#fff" />
          <circle cx="28" cy="50" r="2" fill="#fff" />
          <circle cx="38" cy="52" r="2" fill="#fff" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="14" stroke="#ff8f4a" strokeWidth="3" />
          <path d="M32 22v12" stroke="#ff8f4a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="40" r="2" fill="#ff8f4a" />
        </svg>
      );
  }
}
