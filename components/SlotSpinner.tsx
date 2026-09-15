"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type RestaurantSummary = {
  id: string;
  name: string;
  imageUrl: string;
};

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

export function SlotSpinner({
  restaurants,
}: {
  restaurants: RestaurantSummary[];
}) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RestaurantSummary | null>(null);
  const [displayName, setDisplayName] = useState("Sẵn sàng chọn món");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function spin() {
    if (spinning || restaurants.length === 0) return;

    setSpinning(true);
    setWinner(null);
    const pick = restaurants[Math.floor(Math.random() * restaurants.length)];

    for (let frame = 0; frame < 18; frame += 1) {
      if (!mounted.current) return;
      setDisplayName(restaurants[frame % restaurants.length].name);
      await wait(60 + frame * 12);
    }

    if (!mounted.current) return;
    setDisplayName(pick.name);
    setWinner(pick);
    setSpinning(false);
  }

  return (
    <section
      className="spinner-section section-shell"
      id="quay-trua"
      aria-labelledby="spin-heading"
    >
      <div className="section-label">01 — Chọn nhanh</div>
      <div className="spinner-layout">
        <div className="section-intro">
          <h2 id="spin-heading">Hôm nay ăn trưa gì?</h2>
          <p>
            Vòng quay chọn ngẫu nhiên trong danh sách quán. Thời tiết có lời
            khuyên riêng, không can thiệp kết quả.
          </p>
        </div>

        <div className="slot-machine">
          <div
            className={`slot-window${spinning ? " is-spinning" : ""}`}
            aria-live="polite"
          >
            <span className="slot-eyebrow">
              {spinning ? "Đang đảo món..." : winner ? "Chốt kèo trưa nay" : "Mời quay"}
            </span>
            <strong>{displayName}</strong>
          </div>
          <div className="slot-actions">
            <button type="button" onClick={spin} disabled={spinning}>
              <span>{spinning ? "Đang quay" : "Quay ngay"}</span>
              <span aria-hidden="true">↗</span>
            </button>
            {winner && (
              <Link className="result-link" href={`/restaurants/${winner.id}`}>
                Xem quán vừa chọn
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
