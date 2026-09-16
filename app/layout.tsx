import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AnalyticsPageViews } from "@/components/AnalyticsPageViews";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ScrollTopButton } from "@/components/ScrollTopButton";
import "./globals.css";

const brandFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "600", "700"],
});

const siteUrl =
  process.env.AUTH_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://vnexter-an-gi.vercel.app");

const siteTitle = "Vnexter ăn gì";
const siteDescription =
  "Chọn nhanh quán ăn trưa quanh 219 Trung Kính, Cầu Giấy, Hà Nội — quay random, gợi ý theo thời tiết, xem đánh giá.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s · ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: siteTitle,
  keywords: [
    "ăn trưa",
    "Trung Kính",
    "Cầu Giấy",
    "Hà Nội",
    "Vnexter",
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
    url: "/",
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Vnexter ăn gì — chọn quán trưa quanh 219 Trung Kính",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og.png"],
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
