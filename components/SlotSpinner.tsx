"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type RestaurantSummary = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  tags: string[];
  priceMin?: number | null;
  priceMax?: number | null;
};

const ITEM_WIDTH_MOBILE = 148;
const ITEM_WIDTH_DESKTOP = 200;
const REEL_LOOPS = 8;
const SPIN_MS = 4800;

function getItemWidth(): number {
  if (typeof window === "undefined") return ITEM_WIDTH_MOBILE;
  return window.matchMedia("(min-width: 768px)").matches
    ? ITEM_WIDTH_DESKTOP
    : ITEM_WIDTH_MOBILE;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getFocusable(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
}

export function SlotSpinner({
  restaurants,
  totalAvailable,
  budgetSlot,
}: {
  restaurants: RestaurantSummary[];
  totalAvailable: number;
  budgetSlot?: ReactNode;
}) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RestaurantSummary | null>(null);
  const [landedIndex, setLandedIndex] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const spinBtnRef = useRef<HTMLButtonElement>(null);
  const mounted = useRef(true);

  const reel = useMemo(() => {
    if (restaurants.length === 0) return [] as RestaurantSummary[];
    const loops = Math.max(REEL_LOOPS, restaurants.length > 1 ? 6 : 8);
    return Array.from({ length: loops * restaurants.length }, (_, i) => {
      return restaurants[i % restaurants.length];
    });
  }, [restaurants]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!reveal) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    window.setTimeout(() => {
      (closeBtnRef.current ?? getFocusable(dialog!)[0])?.focus();
    }, 0);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setReveal(false);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = getFocusable(dialog);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
      spinBtnRef.current?.focus?.();
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
    if (spinning || restaurants.length === 0 || reel.length === 0) return;

    const pick =
      restaurants[Math.floor(Math.random() * restaurants.length)];
    const viewportWidth = viewportRef.current?.clientWidth ?? 360;
    const itemWidth = getItemWidth();

    const minIndex = Math.floor(reel.length * 0.55);
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
          {budgetSlot}

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
                          loading="lazy"
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
                ref={spinBtnRef}
                type="button"
                onClick={spin}
                disabled={spinning || restaurants.length === 0}
              >
                <span>{spinning ? "Đang quay" : "Quay ngay"}</span>
                <span aria-hidden="true">↗</span>
              </button>
              {totalAvailable === 0 && (
                <p className="slot-empty">Chưa có quán để quay.</p>
              )}
              {restaurants.length === 0 && totalAvailable > 0 && (
                <p className="slot-empty">
                  Không có quán nào phù hợp với bộ lọc này. Thử chọn bộ lọc khác
                  nhé.
                </p>
              )}
              {winner && !spinning && !reveal && (
                <Link className="result-link" href={`/restaurants/${winner.slug}`}>
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
          ref={dialogRef}
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
                href={`/restaurants/${winner.slug}`}
              >
                Xem chi tiết quán
              </Link>
              <button
                ref={closeBtnRef}
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
