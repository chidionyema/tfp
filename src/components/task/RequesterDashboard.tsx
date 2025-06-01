"use client";
import React from "react";
import { Plus, Activity, Users, TrendingUp, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatsCard } from "../dashboard/StatsCard";
import { RequesterTaskCard } from "./RequesterTaskCard";
import { EnhancedTask, RequesterTaskSummary } from "@/types/dashboard";

interface RequesterDashboardProps {
  requesterTasks: EnhancedTask[];
  onViewClaims: (task: EnhancedTask) => void;
  onEditTask: (task: EnhancedTask) => void;
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  requesterTasks,
  onViewClaims,
  onEditTask,
}) => {
  const router = useRouter();

  const getRequesterStats = (): RequesterTaskSummary => {
    return {
      total: requesterTasks.length,
      open: requesterTasks.filter(t => t.status === 'open').length,
      claimed: requesterTasks.filter(t => t.status === 'claimed').length,
      inProgress: requesterTasks.filter(t => t.status === 'in_progress').length,
      completed: requesterTasks.filter(t => t.status === 'completed').length,
      pendingClaims: requesterTasks.reduce((sum, task) => 
        sum + task.claims.filter(c => c.status === 'pending').length, 0
      )
    };
  };

  const stats = getRequesterStats();

  // Convert DashboardEnhancedTask to the format RequesterTaskCard expects
  const convertTaskForCard = (task: EnhancedTask) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    createdAt: task.createdAt,
    claims: task.claims,
    perks: task.perks,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Your Tasks</h2>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-5 mb-4 sm:mb-6">
          <StatsCard value={stats.total.toString()} label="Total Tasks" icon={Activity} />
          <StatsCard value={stats.pendingClaims.toString()} label="Pending Claims" icon={Users} />
          <StatsCard value={stats.inProgress.toString()} label="In Progress" icon={TrendingUp} />
          <StatsCard value={stats.completed.toString()} label="Completed" icon={Star} />
          <div className="col-span-2 lg:col-span-1">
            <StatsCard
              value=""
              label="New Task"
              icon={Plus}
              variant="action"
              onClick={() => router.push("/tasks/create")}
            >
              <Plus size={16} className="mb-1 sm:size-5" />
              <span className="text-xs font-medium">New Task</span>
            </StatsCard>
          </div>
        </div>

        {stats.pendingClaims > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-amber-600 sm:size-4" />
              <span className="font-medium text-amber-800 dark:text-amber-200 text-sm sm:text-base">
                {stats.pendingClaims} helper{stats.pendingClaims !== 1 ? 's are' : ' is'} waiting for your response
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
              Review claims quickly to secure the best helpers for your tasks.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {requesterTasks.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Activity size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:size-12" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No tasks yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
              Create your first task to get help from our community
            </p>
            <button
              onClick={() => router.push("/tasks/create")}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
            >
              <Plus size={16} className="sm:size-5" />
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {requesterTasks.map((task) => (
              <RequesterTaskCard
                key={task.id}
                task={convertTaskForCard(task)}
                onViewClaims={() => onViewClaims(task)}
                onEditTask={() => onEditTask(task)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};