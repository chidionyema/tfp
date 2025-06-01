"use client";

import React from "react";
import { MapPin, Clock } from "lucide-react";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showClaimButton?: boolean;
  onClaim?: () => void;
}

export default function TaskCard({
  task,
  onClick,
  showClaimButton = true,
  onClaim,
}: TaskCardProps) {
  /* ------------------------------------------------------------------ */
  /* Utils                                                              */
  /* ------------------------------------------------------------------ */
  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "emergency":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      onClick();
    }
  };

  const firstPerk = task.perks?.[0];

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
      onClick={onClick}
      onKeyDown={handleKeyPress}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View details for task: ${task.title}` : undefined}
    >
      {/* ------------------------------------------------------------ */}
      {/* Header Section                                               */}
      {/* ------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {/* Title and badges row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {task.title}
            </h3>
            
            {/* Badges - stack on mobile, inline on desktop */}
            <div className="flex flex-wrap gap-2">
              {task.urgency && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getUrgencyColor(
                    task.urgency as string
                  )}`}
                >
                  {task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)}
                </span>
              )}
              {task.successRate && (
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                  {typeof task.successRate === "number"
                    ? `${task.successRate}%`
                    : task.successRate}{" "}
                  success
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base leading-relaxed">
            {task.description}
          </p>

          {/* Location and duration info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
            {task.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{task.location.address}</span>
              </div>
            )}
            {task.estimatedDuration && (
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="flex-shrink-0" aria-hidden="true" />
                <span>{task.estimatedDuration}</span>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Right column – key perk (mobile: below content, desktop: right) */}
        {/* ------------------------------------------------------------ */}
        {firstPerk && (
          <div className="text-left sm:text-right sm:ml-4 flex-shrink-0 order-first sm:order-last">
            <div
              className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-1 truncate"
              title={firstPerk.description}
            >
              {firstPerk.description || "Perk"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Tier {task.tier}
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Claim button                                                  */}
      {/* -------------------------------------------------------------- */}
      {showClaimButton && onClaim && (
        <div className="flex justify-stretch sm:justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClaim();
            }}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 sm:py-2 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 text-sm sm:text-base touch-manipulation"
            aria-label={`Claim task: ${task.title}`}
          >
            Claim Task
          </button>
        </div>
      )}
    </div>
  );
}