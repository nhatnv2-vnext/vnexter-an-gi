"use client";

import { useEffect, useRef, useState } from "react";

const MAP_EMBED_SRC =
  "https://www.google.com/maps?q=219+Trung+K%C3%ADnh,+C%E1%BA%A7u+Gi%E1%BA%A5y,+H%C3%A0+N%E1%BB%99i&hl=vi&z=16&output=embed";

const MAP_OPEN_URL =
  "https://www.google.com/maps/search/?api=1&query=219+Trung+K%C3%ADnh,+C%E1%BA%A7u+Gi%E1%BA%A5y,+H%C3%A0+N%E1%BB%99i";

export function SiteFooter() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const node = mapRef.current;
    if (!node || mapLoaded) return;

    if (typeof IntersectionObserver === "undefined") {
      setMapLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMapLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [mapLoaded]);

  return (
    <footer className="site-footer" aria-labelledby="footer-map-heading">
      <div className="site-footer-inner section-shell">
        <div className="site-footer-copy">
          <h2 id="footer-map-heading">219 Trung Kính</h2>
          <p>
            Văn phòng quanh Central Point, Yên Hòa, Cầu Giấy, Hà Nội — điểm gốc
            để chọn quán ăn trưa gần đây.
          </p>
          <a
            className="site-footer-map-link"
            href={MAP_OPEN_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở trên Google Maps
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="site-footer-map" ref={mapRef}>
        {mapLoaded ? (
          <iframe
            title="Bản đồ Google Maps — 219 Trung Kính, Cầu Giấy, Hà Nội"
            src={MAP_EMBED_SRC}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="site-footer-map-loading" aria-hidden="true">
            <span className="site-footer-map-loading-pulse" />
          </div>
        )}
      </div>
      <div className="site-footer-bar">
        <p>Vnexter ăn gì · Ăn trưa quanh 219 Trung Kính</p>
      </div>
    </footer>
  );
}
