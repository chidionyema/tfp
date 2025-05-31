"use client";
import React from "react";
import { MapPin, Clock, LockKeyhole, Shield, AlertCircle } from "lucide-react";
import Image from "next/image";
import type { TaskFormData } from "@/types/task";
import { TaskStats } from "./TaskStats";
import { getPerkIcon } from "@/utils/task-utils";
import {
  calculateTotalTaskCost,
  getDbsProcessingTime,
  getDbsRequirementColor,
} from "@/types/task";

interface Step4ReviewProps {
  data: TaskFormData;
  categories: ReturnType<typeof import("@/constants/task-constants").getCategories>;
  urgencyOptions: ReturnType<typeof import("@/constants/task-constants").getUrgencyOptions>;
  successRate: number;
  totalValue: number;
  isCombo: boolean;
  platformFee: number;
  onChange: (field: keyof TaskFormData, value: unknown) => void;
}

export const Step4_Review: React.FC<Step4ReviewProps> = ({
  data,
  categories,
  urgencyOptions,
  successRate,
  totalValue,
  isCombo,
  onChange,
}) => {
  const urgency = urgencyOptions.find((u) => u.id === data.urgency);
  const category = categories.find((c) => c.id === data.category);
  const taskCosts = calculateTotalTaskCost(data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Review & Confirm</h2>
        <p className="text-sm text-gray-600">
          Double-check everything, then confirm escrow to publish your task.
        </p>
      </div>

      {/* headline stats */}
      <TaskStats successRate={successRate} totalValue={totalValue} combo={isCombo} />

      {/* DBS Warning Banner */}
      {data.dbsRequirement && data.dbsRequirement !== "none" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800 text-sm">
                DBS Background Check Required
              </h4>
              <p className="text-xs text-amber-700 mt-1">
                This task requires helpers to have a {data.dbsRequirement} DBS check. This may
                reduce the number of available helpers but ensures appropriate background
                verification. Processing time: {getDbsProcessingTime(data.dbsRequirement)}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* body */}
      <section className="bg-gray-50 rounded-lg p-4 lg:p-6">
        {/* title & description */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {data.title || "Untitled Task"}
        </h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">
          {data.description || "No description provided."}
        </p>

        {/* chips */}
        <div className="flex flex-wrap gap-2 mb-4" aria-label="Task attributes">
          {urgency && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgency.color}`}>
              {urgency.name}
            </span>
          )}
          {category && (
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
              {category.name}
            </span>
          )}
          {data.estimatedDuration && (
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium flex items-center gap-1">
              <Clock size={12} />
              {data.estimatedDuration
                .replace(/minutes?/, "m")
                .replace(/hours?/, "h")}
            </span>
          )}
          {data.dbsRequirement && data.dbsRequirement !== "none" && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDbsRequirementColor(
                data.dbsRequirement,
              )}`}
            >
              <Shield size={12} />
              {data.dbsRequirement.toUpperCase()} DBS
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            {data.perks.length} Perk{data.perks.length !== 1 ? "s" : ""}{" "}
            {isCombo && "(Combo)"}
          </span>
        </div>

        {/* locations */}
        {data.location && (
          <p className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin size={16} className="text-indigo-600 mt-0.5" />
            <span>
              <strong className="text-indigo-600">Pickup:</strong> {data.location.address}
            </span>
          </p>
        )}
        {data.dropoffLocation && (
          <p className="flex items-start gap-2 text-sm text-gray-700 mt-1">
            <MapPin size={16} className="text-green-600 mt-0.5" />
            <span>
              <strong className="text-green-600">Drop-off:</strong> {data.dropoffLocation.address}
            </span>
          </p>
        )}

        {/* specific requirements */}
        {data.specificRequirements && (
          <div className="mt-4">
            <h4 className="font-medium text-sm text-gray-800 mb-1">Specific Requirements</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {data.specificRequirements}
            </p>
          </div>
        )}

        {/* DBS Requirements Details */}
        {data.dbsRequirement && data.dbsRequirement !== "none" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-sm text-blue-800 mb-2 flex items-center gap-1">
              <Shield size={14} />
              Background Check Requirement
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-blue-700">
              <div>
                <span className="font-medium block">Level:</span>
                {data.dbsRequirement.charAt(0).toUpperCase() +
                  data.dbsRequirement.slice(1)}{" "}
                DBS
              </div>
              <div>
                <span className="font-medium block">Fee:</span> £{taskCosts.dbsFee}
                (helper pays)
              </div>
              <div>
                <span className="font-medium block">Processing:</span>{" "}
                {getDbsProcessingTime(data.dbsRequirement)}
              </div>
            </div>
          </div>
        )}

        {/* photos */}
        {data.photos && data.photos.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm text-gray-800 mb-1">Photos</h4>
            <div className="flex flex-wrap gap-2">
              {data.photos.map((file, idx) => {
                const url = URL.createObjectURL(file);
                return (
                  <div
                    key={idx}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border"
                  >
                    <Image
                      src={url}
                      alt={`Task photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      onLoadingComplete={() => URL.revokeObjectURL(url)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* perk package */}
        {data.perks.length > 0 && (
          <div
            className="mt-6 border rounded-lg bg-white p-4"
            aria-labelledby="perk-heading"
          >
            <h4 id="perk-heading" className="font-medium text-base text-gray-900 mb-3">
              Perk Package {isCombo && <span className="text-sm text-purple-600">(Combo)</span>}
            </h4>
            <ul className="space-y-3">
              {data.perks.map((perk) => (
                <li key={perk.id} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5">{getPerkIcon(perk.type)}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 flex items-center gap-1">
                        <LockKeyhole size={12} className="text-indigo-600" /> {perk.name}
                      </span>
                      <span className="text-indigo-600 font-medium">
                        £{((perk.customValue ?? perk.estimatedValue) * (perk.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{perk.description}</p>
                    {perk.quantity && perk.quantity > 1 && (
                      <p className="text-xs text-gray-500">Qty: {perk.quantity}</p>
                    )}
                  </div>
                </li>
              ))}

              {/* summary row */}
              <li className="pt-3 mt-3 border-t text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Total Perk Value</span>
                  <span className="font-medium">£{taskCosts.perkValue.toFixed(2)}</span>
                </div>
                {taskCosts.dbsFee > 0 && (
                  <div className="flex justify-between">
                    <span>DBS Check Fee (helper pays)</span>
                    <span className="text-blue-600">£{taskCosts.dbsFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="text-red-600">-£{taskCosts.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium mt-1 pt-1 border-t">
                  <span>Net to Helper</span>
                  <span className="text-green-600">
                    £{(taskCosts.perkValue - taskCosts.platformFee).toFixed(2)}
                  </span>
                </div>
                {taskCosts.dbsFee > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Total Helper Investment</span>
                    <span>£{(taskCosts.perkValue + taskCosts.dbsFee).toFixed(2)}</span>
                  </div>
                )}
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* Escrow agreement */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <input
          type="checkbox"
          id="escrowAgreed"
          checked={Boolean(data.escrowAgreed)}
          onChange={(e) => onChange("escrowAgreed", e.target.checked)}
          className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2"
        />
        <label htmlFor="escrowAgreed" className="text-sm text-blue-800">
          I understand that my perk is held in escrow and will be released only after I mark the task as complete.
          {data.dbsRequirement && data.dbsRequirement !== "none" && (
            <span className="block mt-1 text-xs">
              I also understand that helpers must complete a {data.dbsRequirement} DBS check before being eligible for this task.
            </span>
          )}
        </label>
      </div>
    </div>
  );
};

export default Step4_Review;
