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
    <>
      <BudgetFilter onChange={setBudgetMax} />
      <SlotSpinner restaurants={restaurants} budgetMax={budgetMax} />
    </>
  );
}
