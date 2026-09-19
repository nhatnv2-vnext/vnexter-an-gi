import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AnalyticsPageViews } from "@/components/AnalyticsPageViews";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ScrollTopButton } from "@/components/ScrollTopButton";
import { getSiteUrl, SITE_BRAND } from "@/lib/site";
import "./globals.css";

const brandFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "600", "700"],
});

const siteUrl = getSiteUrl();
const siteDescription =
  "Chọn nhanh quán ăn trưa quanh 219 Trung Kính, Cầu Giấy, Hà Nội — quay random, gợi ý theo thời tiết, xem đánh giá.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_BRAND,
    template: `%s · ${SITE_BRAND}`,
  },
  description: siteDescription,
  applicationName: SITE_BRAND,
  keywords: [
    "ăn trưa",
    "Trung Kính",
    "Cầu Giấy",
    "Hà Nội",
    "quán ăn",
    "gợi ý món trưa",
  ],
  authors: [{ name: "Vnexter" }],
  creator: "Vnexter",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: SITE_BRAND,
    title: SITE_BRAND,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: "Vnexter ăn gì — chọn quán trưa quanh 219 Trung Kính",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_BRAND,
    description: siteDescription,
    images: [`${siteUrl}/og.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.webp", type: "image/webp" },
    ],
    apple: [
      { url: "/favicon.webp", sizes: "180x180", type: "image/webp" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0b0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={brandFont.variable}>
      <body>
        <GoogleAnalytics />
        <AnalyticsPageViews />
        <div className="site-atmosphere">{children}</div>
        <ScrollTopButton />
      </body>
    </html>
  );
}
