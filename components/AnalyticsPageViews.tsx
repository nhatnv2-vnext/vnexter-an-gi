"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { getGaMeasurementId } from "@/components/GoogleAnalytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function AnalyticsPageViewsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gaId = getGaMeasurementId();

  useEffect(() => {
    if (!gaId || typeof window.gtag !== "function") return;
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams, gaId]);

  return null;
}

export function AnalyticsPageViews() {
  if (!getGaMeasurementId()) return null;

  return (
    <Suspense fallback={null}>
      <AnalyticsPageViewsInner />
    </Suspense>
  );
}
