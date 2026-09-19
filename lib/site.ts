/** Shared site URL and brand constants for SEO/metadata. */

export const SITE_BRAND = "Vnexter ăn gì";
export const SITE_BRAND_ASCII = "Vnexter an gi";

export function getSiteUrl(): string {
  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://vnexter-an-gi.vercel.app")
  );
}
