"use client";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RestaurantCard,
  type RestaurantListItem,
} from "@/components/RestaurantCard";

const MOBILE_PAGE_SIZE = 4;
const DESKTOP_PAGE_SIZE = 10;
const MOBILE_MQ = "(max-width: 760px)";

function usePageSize() {
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MQ);
    const sync = () => {
      setPageSize(media.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return pageSize;
}

export function RestaurantList({
  restaurants,
  totalUnfiltered,
}: {
  restaurants: RestaurantListItem[];
  totalUnfiltered?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = usePageSize();
  const headingRef = useRef<HTMLHeadingElement>(null);
  
  const page = useMemo(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) - 1 : 0;
  }, [searchParams]);

  const totalPages = Math.max(1, Math.ceil(restaurants.length / pageSize));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const start = safePage * pageSize;
  const pageItems = restaurants.slice(start, start + pageSize);

  const from = restaurants.length === 0 ? 0 : start + 1;
  const to = Math.min(start + pageSize, restaurants.length);
  const showPager = restaurants.length > pageSize;
  const filteredOut =
    typeof totalUnfiltered === "number" &&
    totalUnfiltered > restaurants.length;

  const goTo = useCallback(
    (next: number) => {
      const target = Math.max(0, Math.min(totalPages - 1, next));
      const params = new URLSearchParams(searchParams.toString());
      
      if (target === 0) {
        params.delete("page");
      } else {
        params.set("page", (target + 1).toString());
      }
      
      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      router.push(newUrl, { scroll: false });
      headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [router, searchParams, totalPages]
  );

  return (
    <section
      className="restaurants-section section-shell"
      aria-labelledby="restaurants-heading"
    >
      <div className="restaurants-heading">
        <div>
          <h2 id="restaurants-heading" ref={headingRef}>
            Quán ăn trưa quanh đây
          </h2>
          <p>
            Những địa chỉ gần 219 Trung Kính, đủ gần để đi ăn trưa mà không cần
            vội.
          </p>
          {filteredOut && (
            <p className="restaurants-filter-note">
              Đang hiện {restaurants.length}/{totalUnfiltered} quán theo bộ lọc.
            </p>
          )}
        </div>
      </div>

      {restaurants.length === 0 ? (
        <p className="restaurants-empty">
          Không có quán nào khớp bộ lọc. Thử đổi giá, loại món, hoặc tắt “Đang
          mở”.
        </p>
      ) : (
        <div className="restaurant-list" aria-live="polite">
          {pageItems.map((restaurant, index) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              index={start + index}
              priority={index === 0 && safePage === 0}
            />
          ))}
        </div>
      )}

      {restaurants.length > 0 && (
        <div className="restaurant-pagination">
          <p className="restaurant-pagination-meta">
            {from}–{to} trong {restaurants.length} quán
          </p>
          {showPager && (
            <nav
              className="restaurant-pagination-nav"
              aria-label="Phân trang danh sách quán"
            >
              <button
                type="button"
                className="restaurant-page-btn"
                onClick={() => goTo(safePage - 1)}
                disabled={safePage === 0}
                aria-label="Trang trước"
              >
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0z"
                  />
                </svg>
              </button>
              <ol className="restaurant-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className={`restaurant-page-num${
                        i === safePage ? " is-active" : ""
                      }`}
                      onClick={() => goTo(i)}
                      aria-label={`Trang ${i + 1}`}
                      aria-current={i === safePage ? "page" : undefined}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="restaurant-page-btn"
                onClick={() => goTo(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                aria-label="Trang sau"
              >
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4z"
                  />
                </svg>
              </button>
            </nav>
          )}
        </div>
      )}
    </section>
  );
}
