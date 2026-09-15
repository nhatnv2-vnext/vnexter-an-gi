"use client";

import { useEffect, useState } from "react";
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
}: {
  restaurants: RestaurantListItem[];
}) {
  const pageSize = usePageSize();
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(restaurants.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const pageItems = restaurants.slice(start, start + pageSize);

  const from = restaurants.length === 0 ? 0 : start + 1;
  const to = Math.min(start + pageSize, restaurants.length);
  const showPager = restaurants.length > pageSize;

  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  function goTo(next: number) {
    setPage(Math.max(0, Math.min(totalPages - 1, next)));
  }

  return (
    <section
      className="restaurants-section section-shell"
      aria-labelledby="restaurants-heading"
    >
      <div className="section-label">03 — Đi ăn thôi</div>
      <div className="restaurants-heading">
        <h2 id="restaurants-heading">Quán ăn trưa quanh đây</h2>
        <p>
          Những địa chỉ gần 219 Trung Kính, đủ gần để đi ăn trưa mà không cần
          vội.
        </p>
      </div>

      <div className="restaurant-list" aria-live="polite">
        {pageItems.map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            index={start + index}
          />
        ))}
      </div>

      {restaurants.length > 0 && (
        <div className="restaurant-pagination">
          <p className="restaurant-pagination-meta">
            {from}–{to} / {restaurants.length} quán
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
              >
                Trước
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
              >
                Sau
              </button>
            </nav>
          )}
        </div>
      )}
    </section>
  );
}
