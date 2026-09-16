"use client";

import { useState } from "react";

type BudgetOption = {
  id: string;
  label: string;
  max: number | null;
};

const BUDGET_OPTIONS: BudgetOption[] = [
  { id: "all", label: "Bất kỳ", max: null },
  { id: "30k", label: "≤ 30k", max: 30000 },
  { id: "50k", label: "≤ 50k", max: 50000 },
  { id: "80k", label: "≤ 80k", max: 80000 },
];

export function BudgetFilter({
  onChange,
}: {
  onChange: (maxBudget: number | null) => void;
}) {
  const [selected, setSelected] = useState<string>("all");

  function handleSelect(optionId: string) {
    setSelected(optionId);
    const option = BUDGET_OPTIONS.find((o) => o.id === optionId);
    onChange(option?.max ?? null);
  }

  return (
    <div className="budget-filter">
      <label className="budget-filter-label">Ngân sách trưa</label>
      <div className="budget-filter-chips">
        {BUDGET_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`filter-chip${selected === option.id ? " is-active" : ""}`}
            onClick={() => handleSelect(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
