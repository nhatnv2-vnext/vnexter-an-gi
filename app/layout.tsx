import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Manrope } from "next/font/google";
import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Manrope({
  variable: "--font-display",
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vnexter ăn gì",
  description: "Chọn nhanh quán ăn trưa quanh 219 Trung Kính, Hà Nội.",
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <div className="site-atmosphere">{children}</div>
      </body>
    </html>
  );
}
