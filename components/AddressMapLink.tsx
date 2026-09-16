import { googleMapsSearchUrl } from "@/lib/maps";

type Props = {
  address: string;
  className?: string;
};

function LocationIcon() {
  return (
    <svg
      className="address-location-icon"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
      />
    </svg>
  );
}

export function AddressMapLink({ address, className }: Props) {
  const trimmed = address.trim();
  if (!trimmed) return null;

  return (
    <a
      className={["address-map-link", className].filter(Boolean).join(" ")}
      href={googleMapsSearchUrl(trimmed)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Mở ${trimmed} trên Google Maps`}
    >
      <LocationIcon />
      <span className="address-map-text">{trimmed}</span>
    </a>
  );
}
