"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BudgetFilter } from "./BudgetFilter";

export type RestaurantSummary = {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[];
  priceMin?: number | null;
  priceMax?: number | null;
};

type CuisineFilter = {
  id: string;
  label: string;
  tags: string[];
};

const ITEM_WIDTH_MOBILE = 148;
const ITEM_WIDTH_DESKTOP = 200;
const REEL_LOOPS = 28;
const SPIN_MS = 4800;

function getItemWidth(): number {
  if (typeof window === "undefined") return ITEM_WIDTH_MOBILE;
  return window.matchMedia("(min-width: 768px)").matches
    ? ITEM_WIDTH_DESKTOP
    : ITEM_WIDTH_MOBILE;
}

const CUISINE_FILTERS: CuisineFilter[] = [
  { id: "mon-nuoc", label: "Món nước", tags: ["pho", "bun", "nong"] },
  { id: "com", label: "Cơm", tags: ["com"] },
  { id: "cuon", label: "Cuốn", tags: ["cuon", "nhe"] },
  { id: "all", label: "Tất cả", tags: [] },
];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SlotSpinner({
  restaurants,
  budgetMax,
  onBudgetChange,
}: {
  restaurants: RestaurantSummary[];
  budgetMax?: number | null;
  onBudgetChange: (maxBudget: number | null) => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RestaurantSummary | null>(null);
  const [landedIndex, setLandedIndex] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const viewportRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;
    
    // Apply cuisine filter
    if (selectedFilter !== "all") {
      const filter = CUISINE_FILTERS.find((f) => f.id === selectedFilter);
      if (filter && filter.tags.length > 0) {
        filtered = filtered.filter((r) =>
          filter.tags.some((tag) => r.tags.includes(tag))
        );
      }
    }
    
    // Apply budget filter
    if (budgetMax && budgetMax > 0) {
      filtered = filtered.filter((r) => {
        // Include restaurants without price data (assumed affordable)
        if (!r.priceMin && !r.priceMax) return true;
        // Include if min price is within budget
        if (r.priceMin && r.priceMin <= budgetMax) return true;
        // Include if max price is within budget
        if (r.priceMax && r.priceMax <= budgetMax) return true;
        return false;
      });
    }
    
    return filtered;
  }, [restaurants, selectedFilter, budgetMax]);

  const reel = useMemo(() => {
    if (filteredRestaurants.length === 0) return [] as RestaurantSummary[];
    return Array.from({ length: REEL_LOOPS * filteredRestaurants.length }, (_, i) => {
      return filteredRestaurants[i % filteredRestaurants.length];
    });
  }, [filteredRestaurants]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!reveal) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReveal(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [reveal]);

  function finishSpin(pick: RestaurantSummary, winnerIndex: number) {
    setWinner(pick);
    setLandedIndex(winnerIndex);
    setSpinning(false);
    setAnimate(false);
    setReveal(true);
  }

  function spin() {
    if (spinning || filteredRestaurants.length === 0 || reel.length === 0) return;

    const pick = filteredRestaurants[Math.floor(Math.random() * filteredRestaurants.length)];
    const viewportWidth = viewportRef.current?.clientWidth ?? 360;
    const itemWidth = getItemWidth();

    const minIndex = Math.floor(reel.length * 0.72);
    let winnerIndex = -1;
    for (let i = minIndex; i < reel.length; i += 1) {
      if (reel[i].id === pick.id) {
        winnerIndex = i;
        break;
      }
    }
    if (winnerIndex < 0) {
      for (let i = reel.length - 1; i >= 0; i -= 1) {
        if (reel[i].id === pick.id) {
          winnerIndex = i;
          break;
        }
      }
    }

    const jitter = (Math.random() - 0.5) * (itemWidth * 0.45);
    const targetOffset =
      winnerIndex * itemWidth + itemWidth / 2 - viewportWidth / 2 + jitter;

    setWinner(null);
    setLandedIndex(null);
    setReveal(false);
    setSpinning(true);
    setAnimate(false);
    setOffset(0);

    const reduced = prefersReducedMotion();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!mounted.current) return;
        if (reduced) {
          setOffset(targetOffset);
          finishSpin(pick, winnerIndex);
          return;
        }
        setAnimate(true);
        setOffset(targetOffset);
        window.setTimeout(() => {
          if (!mounted.current) return;
          finishSpin(pick, winnerIndex);
        }, SPIN_MS + 80);
      });
    });
  }

  return (
    <div aria-labelledby="spin-heading">
      <div className="spinner-layout">
        <div className="section-intro">
          <h2 id="spin-heading">Trưa nay ăn gì?</h2>
          <p>
            Chạm Quay để chọn quán trưa quanh Trung Kính. Kim giữa sẽ chốt kết
            quả.
          </p>
        </div>

        <div className="spinner-controls">
          <div className="spinner-filters">
            <BudgetFilter onChange={onBudgetChange} />
            <div className="cuisine-filter-group">
              <label className="cuisine-filter-label">Loại đồ ăn</label>
              <div className="cuisine-filters">
                {CUISINE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={`filter-chip${selectedFilter === filter.id ? " is-active" : ""}`}
                    onClick={() => setSelectedFilter(filter.id)}
                    disabled={spinning}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="slot-machine">
          <div className="case-opening">
            <span className="slot-eyebrow">
              {spinning
                ? "Đang chọn quán trưa..."
                : winner
                  ? "Chốt kèo trưa nay"
                  : "Mời quay"}
            </span>

            <div
              className={`case-viewport${spinning ? " is-spinning" : ""}`}
              ref={viewportRef}
              aria-hidden={spinning || undefined}
            >
              <div className="case-marker" aria-hidden="true" />
              <div
                className={`case-strip${animate ? " is-animating" : ""}`}
                style={{ transform: `translate3d(${-offset}px, 0, 0)` }}
              >
                {reel.map((item, index) => (
                  <div
                    className={`case-item${
                      landedIndex === index ? " is-winner" : ""
                    }`}
                    key={`${item.id}-${index}`}
                  >
                    <div className="case-thumb">
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 112px, 72px"
                        className="case-thumb-image"
                      />
                    </div>
                    <span className="case-item-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {winner && !spinning ? `Chốt kèo trưa nay: ${winner.name}` : ""}
          </p>

          <div className="slot-actions">
            <button
              type="button"
              onClick={spin}
              disabled={spinning || filteredRestaurants.length === 0}
            >
              <span>{spinning ? "Đang quay" : "Quay ngay"}</span>
              <span aria-hidden="true">↗</span>
            </button>
            {restaurants.length === 0 && (
              <p className="slot-empty">Chưa có quán để quay.</p>
            )}
            {filteredRestaurants.length === 0 && restaurants.length > 0 && (
              <p className="slot-empty">
                Không có quán nào phù hợp với bộ lọc này. Thử chọn bộ lọc khác nhé.
              </p>
            )}
            {winner && !spinning && !reveal && (
              <Link className="result-link" href={`/restaurants/${winner.id}`}>
                Xem quán vừa chọn
              </Link>
            )}
          </div>
        </div>
        </div>
      </div>

      {reveal && winner && (
        <div
          className="case-reveal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-reveal-title"
        >
          <button
            type="button"
            className="case-reveal-backdrop"
            aria-label="Đóng phần thưởng"
            onClick={() => setReveal(false)}
          />
          <div className="case-reveal-flash" aria-hidden="true" />
          <div className="case-reveal-card">
            <div className="case-reveal-beams" aria-hidden="true" />
            <div className="case-reveal-glow" aria-hidden="true" />
            <div className="case-reveal-media">
              <Image
                src={winner.imageUrl}
                alt=""
                fill
                sizes="280px"
                className="case-reveal-image"
                priority
              />
            </div>
            <p className="case-reveal-eyebrow">Trưa nay nên ăn</p>
            <h3 id="case-reveal-title">{winner.name}</h3>
            <div className="case-reveal-actions">
              <Link
                className="case-reveal-primary"
                href={`/restaurants/${winner.id}`}
              >
                Xem chi tiết quán
              </Link>
              <button
                type="button"
                className="case-reveal-secondary"
                onClick={() => setReveal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
