// TaskGrid Component
"use client";
import React, { useRef, useEffect } from "react";
import { Search, Activity, Star, X } from "lucide-react";
import TaskCard from "@/components/task/TaskCard";
import { EnhancedTask } from "@/types/dashboard";
import { Task } from "@/types/task";

interface TaskGridProps {
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

export const TaskGrid: React.FC<TaskGridProps> = ({
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
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreTasks && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, hasMoreTasks, isLoadingMore]);

  if (loading) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="animate-spin w-5 h-5 sm:w-6 sm:h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <div className="text-gray-500 text-sm sm:text-base">Loading tasks...</div>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <Search size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:size-12" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No tasks found
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
          {searchQuery ? `No tasks match "${searchQuery}"` : "No tasks available right now"}
        </p>
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium touch-manipulation"
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Error Banner */}
      {claimError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mx-3 sm:mx-0">
          <div className="flex items-center gap-2">
            <X size={14} className="text-red-600 sm:size-4" />
            <span className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200 flex-1">
              {claimError}
            </span>
            <button 
              onClick={onClearError}
              className="text-red-600 hover:text-red-700 p-1 touch-manipulation"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Search Results Info */}
      {searchQuery && (
        <div className="flex items-center justify-between py-2 px-3 sm:px-1">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Found {filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'} for &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={onClearSearch}
            className="text-xs text-indigo-600 hover:text-indigo-700 touch-manipulation"
          >
            Clear
          </button>
        </div>
      )}

      {/* Task Cards */}
      <div className="px-3 sm:px-0 space-y-3 sm:space-y-4">
        {displayedTasks.map((enhancedTask) => {
          // Convert EnhancedTask to Task for the TaskCard component
          const taskForCard: Task = {
            id: enhancedTask.id,
            title: enhancedTask.title,
            description: enhancedTask.description,
            location: enhancedTask.location,
            status: enhancedTask.status,
            perks: enhancedTask.perks,
            createdAt: enhancedTask.createdAt,
            requesterId: enhancedTask.requesterId,
            dbsRequirement: enhancedTask.dbsRequirement,
            urgency: enhancedTask.urgency,
            estimatedDuration: enhancedTask.estimatedDuration,
            successRate: enhancedTask.successRate,
            tier: enhancedTask.tier,
            mode: enhancedTask.mode,
            category: enhancedTask.category,
          };

          return (
            <div key={enhancedTask.id} className="relative">
              <TaskCard
                task={taskForCard}
                onClick={() => onTaskClick(enhancedTask.id)}
                onClaim={() => onTaskClaim(enhancedTask)}
                showClaimButton={enhancedTask.status === "open"}
              />
              
              {/* Claimed Status Badge */}
              {enhancedTask.status === "claimed" && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                  {enhancedTask.claims.filter(c => c.status === 'pending').length} claim{enhancedTask.claims.filter(c => c.status === 'pending').length !== 1 ? 's' : ''}
                </div>
              )}
              
              {/* Success Overlay */}
              {justClaimed === enhancedTask.id && (
                <div className="absolute inset-0 bg-green-500/10 border-2 border-green-500 rounded-xl flex items-center justify-center pointer-events-none">
                  <div className="bg-green-500 text-white px-3 py-2 sm:px-4 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base">
                    <Star size={14} className="sm:size-4" />
                    <span className="hidden xs:inline">Claim Submitted Successfully!</span>
                    <span className="xs:hidden">Claimed!</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Infinite Scroll Sentinel */}
      {hasMoreTasks && (
        <div ref={sentinelRef} className="h-4">
          {isLoadingMore && (
            <div className="text-center py-4 sm:py-6">
              <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-xs sm:text-sm text-gray-500">Loading more tasks...</div>
            </div>
          )}
        </div>
      )}
      
      {/* End of Results */}
      {!hasMoreTasks && displayedTasks.length > 6 && (
        <div className="text-center py-6 sm:py-8 px-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <Activity size={20} className="text-gray-400 sm:size-6" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            You&apos;ve seen all available tasks
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Check back later for new opportunities
          </p>
        </div>
      )}
    </div>
  );
};