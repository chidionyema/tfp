"use client";
import React from "react";
import { TrendingUp, DollarSign, Star } from "lucide-react";
import { StatsCard } from "../dashboard/StatsCard";
import { TaskGrid } from "../dashboard/TaskGrid";
import { EnhancedTask } from "@/types/dashboard";

interface HelperDashboardProps {
  loading: boolean;
  filteredTasks: EnhancedTask[];
  displayedTasks: EnhancedTask[];
  searchQuery: string;
  justClaimed: string | null;
  claimError: string | null;
  hasMoreTasks: boolean;
  isLoadingMore: boolean;
  onClearSearch: () => void;
  onClearError: () => void;
  onTaskClick: (taskId: string) => void;
  onTaskClaim: (task: EnhancedTask) => void;
  onLoadMore: () => void;
}

export const HelperDashboard: React.FC<HelperDashboardProps> = ({
  loading,
  filteredTasks,
  displayedTasks,
  searchQuery,
  justClaimed,
  claimError,
  hasMoreTasks,
  isLoadingMore,
  onClearSearch,
  onClearError,
  onTaskClick,
  onTaskClaim,
  onLoadMore,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Performance Stats */}
      <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
          <TrendingUp size={16} className="text-green-600 sm:size-5" />
          Your Performance
          <span className="ml-auto text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            Last 7 days
          </span>
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <StatsCard value="£35" label="Today" icon={DollarSign} />
          <StatsCard value="£180" label="This Week" icon={TrendingUp} />
          <StatsCard value="4.8★" label="Rating" icon={Star} />
        </div>
      </div>

      {/* Task Grid */}
      <TaskGrid
        loading={loading}
        filteredTasks={filteredTasks}
        displayedTasks={displayedTasks}
        searchQuery={searchQuery}
        justClaimed={justClaimed}
        claimError={claimError}
        hasMoreTasks={hasMoreTasks}
        isLoadingMore={isLoadingMore}
        onClearSearch={onClearSearch}
        onClearError={onClearError}
        onTaskClick={onTaskClick}
        onTaskClaim={onTaskClaim}
        onLoadMore={onLoadMore}
      />
    </div>
  );
};