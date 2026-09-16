"use client";

import { useState } from "react";
import { BudgetFilter } from "./BudgetFilter";
import { SlotSpinner, RestaurantSummary } from "./SlotSpinner";

export function SpinnerSection({
  restaurants,
}: {
  restaurants: RestaurantSummary[];
}) {
  const [budgetMax, setBudgetMax] = useState<number | null>(null);

  return (
    <section className="spinner-section section-shell" id="quay-trua">
      <div className="section-label">01 — Chọn nhanh</div>
      <BudgetFilter onChange={setBudgetMax} />
      <SlotSpinner restaurants={restaurants} budgetMax={budgetMax} />
    </section>
  );
}
