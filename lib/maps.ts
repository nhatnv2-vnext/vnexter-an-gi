export function googleMapsSearchUrl(address: string): string {
  const query = address.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
