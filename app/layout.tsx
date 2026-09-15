import type { Metadata } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["vietnamese", "latin"],
});

export const metadata: Metadata = {
  title: "Hôm nay ăn gì",
  description: "Chọn nhanh quán ăn trưa quanh 219 Trung Kính, Hà Nội.",
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
