"use client";
import React from "react";
import { StatusBanner } from "../dashboard/StatusBanner";

type TaskStatus = "open" | "claimed" | "negotiating" | "accepted" | "in_progress" | "completed" | "disputed" | "cancelled" | "expired";
type ClaimStatus = "pending" | "approved" | "rejected" | "withdrawn" | "expired";

interface TaskClaim {
  id: string;
  status: ClaimStatus;
  helperName: string;
  proposedFee: number;
}

interface PerkItem {
  estimatedValue: number;
}

interface EnhancedTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  claims: TaskClaim[];
  perks: PerkItem[];
}

interface RequesterTaskCardProps {
  task: EnhancedTask;
  onViewClaims: (task: EnhancedTask) => void;
  onEditTask: (task: EnhancedTask) => void;
}

export const RequesterTaskCard: React.FC<RequesterTaskCardProps> = ({
  task,
  onViewClaims,
  onEditTask,
}) => {
  const pendingClaims = task.claims.filter(c => c.status === 'pending').length;
  const acceptedClaim = task.claims.find(c => c.status === 'approved');
  
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'claimed': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStatusBanner = () => {
    if (task.status === 'open') {
      return <StatusBanner type="waiting" />;
    }
    if (task.status === 'claimed' && pendingClaims > 0) {
      return <StatusBanner type="claimed" count={pendingClaims} />;
    }
    if (acceptedClaim) {
      return (
        <StatusBanner 
          type="accepted" 
          helperName={acceptedClaim.helperName}
          helperFee={acceptedClaim.proposedFee}
        />
      );
    }
    return null;
  };

  const renderActionButtons = () => {
    if (task.status === 'claimed' && pendingClaims > 0) {
      return (
        <button
          onClick={() => onViewClaims(task)}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium text-sm sm:text-base touch-manipulation"
        >
          Review {pendingClaims} Claim{pendingClaims !== 1 ? 's' : ''}
        </button>
      );
    }
    
    if (task.status === 'open') {
      return (
        <button
          onClick={() => onEditTask(task)}
          className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:active:bg-gray-500 py-3 px-4 rounded-lg transition-colors font-medium text-sm sm:text-base touch-manipulation"
        >
          Edit Task
        </button>
      );
    }

    if (task.status === 'accepted' || task.status === 'in_progress') {
      return (
        <button
          onClick={() => onViewClaims(task)}
          className="w-full bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 dark:active:bg-green-900/70 py-3 px-4 rounded-lg transition-colors font-medium text-sm sm:text-base touch-manipulation"
        >
          View Progress
        </button>
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-base sm:text-lg leading-tight">
            {task.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3">
            {task.description}
          </p>
        </div>
        
        {/* Status Badge */}
        <div className="flex justify-start sm:justify-end">
          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stats Section - Mobile: Stacked, Desktop: Side by side */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4">
        <div className="flex justify-between sm:block">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Total Value</div>
          <div className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg">
            £{task.perks.reduce((sum, perk) => sum + perk.estimatedValue, 0)}
          </div>
        </div>
        <div className="flex justify-between sm:block">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Created</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {formatDate(task.createdAt)}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mb-4">
        {renderStatusBanner()}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {renderActionButtons()}
      </div>
    </div>
  );
};