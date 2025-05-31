"use client";
import React from "react";
import { DollarSign } from "lucide-react";
import type { TaskFormData, PerkItem } from "@/types/task";
import { PerkCard } from "./PerkCard";
import { getPerkIcon } from "@/utils/task-utils";

interface S3Props {
  data: TaskFormData;
  errors: Record<string, string>;
  addPerk: (type: "payment" | "good" | "service") => void;
  updatePerk: (id: string, updates: Partial<PerkItem>) => void;
  removePerk: (id: string) => void;
  totalValue: number;
  platformFee: number;
  isCombo: boolean;
  comboBonus: number;
  onChange: (field: keyof TaskFormData, value: unknown) => void;
}

export const Step3_Perks: React.FC<S3Props> = ({
  data,
  errors,
  addPerk,
  updatePerk,
  removePerk,
  totalValue,
  platformFee,
  isCombo,
  comboBonus,
  onChange,
}) => (
  <div className="space-y-5 sm:space-y-6">
    {/* -------------------------------------------------------- */}
    {/* Intro */}
    {/* -------------------------------------------------------- */}
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
        Offer Your Perks
      </h2>
      <p className="text-sm text-gray-600">
        Combine payments, goods, or services to create an attractive offer.
      </p>
    </div>

    {/* -------------------------------------------------------- */}
    {/* Escrow explainer */}
    {/* -------------------------------------------------------- */}
    <div
      className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4"
      role="complementary"
      aria-labelledby="escrow-info-heading"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <DollarSign
          size={20}
          className="text-blue-600 mt-0.5 flex-shrink-0"
          aria-hidden="true"
        />
        <div>
          <h4
            id="escrow-info-heading"
            className="font-medium text-blue-800 text-sm sm:text-base"
          >
            Multi-Type Escrow System
          </h4>
          <p className="text-xs sm:text-sm text-blue-700 mt-1">
            Different perk types have different escrow protections:
          </p>
          <ul className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>
              <strong>Payments:</strong> Held in digital escrow until task
              completion.
            </li>
            <li>
              <strong>Physical Goods:</strong> Optional platform
              storage/verification.
            </li>
            <li>
              <strong>Services:</strong> Milestone tracking and completion
              mediation.
            </li>
          </ul>
          {totalValue > 0 && (
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-blue-800">
              Platform fee: ${platformFee.toFixed(2)}
              <span className="block text-xs sm:inline">
                {' '}(Note: Escrow for goods may have additional fees)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* -------------------------------------------------------- */}
    {/* Add‑perk buttons */}
    {/* -------------------------------------------------------- */}
    <div>
      <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
        Add Perks to Your Task
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {(["payment", "good", "service"] as const).map((t) => (
          <button
            key={t}
            onClick={() => addPerk(t)}
            type="button"
            aria-label={`Add ${t === "payment" ? "payment option" : t} perk`}
            className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <div className="text-center">
              {getPerkIcon(t)}
              <h4 className="font-medium text-gray-900 text-sm sm:text-base mt-1">
                {t === "payment" ? "Add Payment Option" : `Add ${t.charAt(0).toUpperCase() + t.slice(1)}`}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {t === "payment"
                  ? "Debit/Credit, Digital Wallets"
                  : t === "good"
                  ? "Items, Vouchers"
                  : "Rides, Delivery"}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------ */}
      {/* Combo bonus banner */}
      {/* ------------------------------------------------------ */}
      {isCombo && (
        <div
          className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4"
          role="status"
        >
          <div className="flex items-center gap-2">
            <span
              className="text-purple-600 text-lg"
              role="img"
              aria-label="gift"
              aria-hidden="true"
            >
              🎁
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-purple-800">
                Combination Perk Bonus!
              </h4>
              <p className="text-xs text-purple-700">
                Increased appeal (+{comboBonus}% success rate).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* -------------------------------------------------------- */}
    {/* Existing perks list */}
    {/* -------------------------------------------------------- */}
    {data.perks.length > 0 && (
      <div>
        <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
          Your Perk Offer Details
        </h3>
        <div
          className="space-y-3 sm:space-y-4"
          role="list"
          aria-label="Current perks list"
        >
          {data.perks.map((perk) => (
            <PerkCard
              key={perk.id}
              perk={perk}
              errors={errors}
              onUpdate={updatePerk}
              onRemove={removePerk}
            />
          ))}
        </div>
        {errors.perks &&
          !Object.keys(errors).some((k) => k.startsWith("perk_") && k !== "perks") && (
            <p className="text-red-500 text-xs mt-2" role="alert">
              {errors.perks}
            </p>
          )}
      </div>
    )}

    {data.perks.length === 0 && errors.perks && (
      <p className="text-red-500 text-sm text-center py-4" role="alert">
        {errors.perks}
      </p>
    )}

    {/* -------------------------------------------------------- */}
    {/* Perk summary */}
    {/* -------------------------------------------------------- */}
    {data.perks.length > 0 && (
      <div
        className="bg-indigo-50 rounded-lg p-3 sm:p-4 border border-indigo-200 mt-4 sm:mt-6"
        role="region"
        aria-labelledby="perk-summary-heading"
      >
        <h4
          id="perk-summary-heading"
          className="font-medium text-indigo-900 mb-2 text-sm sm:text-base"
        >
          Perk Offer Summary
        </h4>
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-indigo-700">Total Value:</span>
            <span className="font-medium text-indigo-900">
              ${totalValue.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-indigo-700">Platform Fee ({
              ((platformFee / totalValue) * 100 || 0).toFixed(0)
            }%):</span>
            <span className="font-medium text-indigo-900">
              -${platformFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t border-indigo-200 pt-1 sm:pt-2 mt-1 sm:mt-2">
            <span className="text-indigo-700 font-medium">Net to Helper:</span>
            <span className="font-bold text-indigo-900">
              ${(totalValue - platformFee).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    )}

    {/* -------------------------------------------------------- */}
    {/* Negotiation toggle */}
    {/* -------------------------------------------------------- */}
    <div className="flex items-center gap-2 sm:gap-3 pt-2">
      <input
        type="checkbox"
        id="allowNegotiation"
        checked={data.allowNegotiation}
        onChange={(e) => onChange("allowNegotiation", e.target.checked)}
        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2"
      />
      <label
        htmlFor="allowNegotiation"
        className="text-sm font-medium text-gray-700"
      >
        Allow helpers to negotiate perk details
      </label>
    </div>
  </div>
);
