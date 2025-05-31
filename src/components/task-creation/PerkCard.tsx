"use client";
import { X } from "lucide-react";
import type { PerkItem } from "@/types/task";
import { InputField } from "@/components/form";
import { getPerkIcon } from "@/utils/task-utils";
import React from "react";

interface Props {
  perk: PerkItem;
  errors: Record<string, string>;
  onUpdate: (id: string, updates: Partial<PerkItem>) => void;
  onRemove: (id: string) => void;
}

export const PerkCard: React.FC<Props> = ({ perk, errors, onUpdate, onRemove }) => {
  const idPrefix = `perk-${perk.id}`;

  // Ensure both inputs are controlled from first render ---------------------
  const nameValue = perk.name ?? "";

  const numericValue =
    perk.customValue !== undefined
      ? perk.customValue.toString()
      : perk.estimatedValue !== undefined
      ? perk.estimatedValue.toString()
      : ""; // empty string keeps input controlled but empty

  const totalValue = (
    (perk.customValue ?? perk.estimatedValue) * (perk.quantity || 1)
  ).toFixed(2);

  return (
    <div
      className="bg-gray-50 rounded-lg p-3 border"
      role="region"
      aria-labelledby={`${idPrefix}-heading`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getPerkIcon(perk.type)}
          <h4
            id={`${idPrefix}-heading`}
            className="font-medium text-gray-900 capitalize text-sm"
          >
            {perk.type} Perk
          </h4>
        </div>
        <button
          onClick={() => onRemove(perk.id)}
          aria-label={`Remove perk ${perk.name}`}
          className="p-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        >
          <X size={18} />
        </button>
      </div>

      {/* --- Name & Value --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InputField
          label="Perk Name"
          required
          id={`${idPrefix}-name`}
          error={errors[`perk_${perk.id}_name`]}
        >
          <input
            type="text"
            value={nameValue}
            onChange={(e) => onUpdate(perk.id, { name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </InputField>

        <InputField
          label="Est. Value ($)"
          required
          id={`${idPrefix}-value`}
          error={errors[`perk_${perk.id}_value`]}
        >
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={numericValue}
            onChange={(e) =>
              onUpdate(perk.id, {
                customValue:
                  e.target.value === "" ? undefined : parseFloat(e.target.value),
              })
            }
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </InputField>
      </div>

      {/* -- total -- */}
      <p className="mt-2 text-xs text-gray-600">
        Total value: <span className="font-medium">${totalValue}</span>
      </p>
    </div>
  );
};
