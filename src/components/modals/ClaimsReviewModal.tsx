"use client";
import React, { useState } from "react";
import { X, Users, Star } from "lucide-react";
import { EnhancedTask } from "@/types/dashboard";

interface ClaimsReviewModalProps {
  task: EnhancedTask;
  onClose: () => void;
  onAcceptClaim: (claimId: string) => void;
  onRejectClaim: (claimId: string) => void;
  onMessage: (helperId: string) => void;
}

export const ClaimsReviewModal: React.FC<ClaimsReviewModalProps> = ({
  task,
  onClose,
  onAcceptClaim,
  onRejectClaim,
  onMessage,
}) => {
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'date'>('rating');

  const pendingClaims = task.claims.filter(c => c.status === 'pending');
  
  const sortedClaims = [...pendingClaims].sort((a, b) => {
    switch (sortBy) {
      case 'rating': return b.helperRating - a.helperRating;
      case 'price': return a.proposedFee - b.proposedFee;
      case 'date': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: return 0;
    }
  });

  const formatTimeAgo = (dateString: string) => {
    const hours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl relative shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <X size={20} />
        </button>
        
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-2">Review Claims</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-medium">{task.title}</span> • {pendingClaims.length} pending claim{pendingClaims.length !== 1 ? 's' : ''}
          </p>
          
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            {[
              { value: 'rating', label: 'Rating' },
              { value: 'price', label: 'Price' },
              { value: 'date', label: 'Newest' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSortBy(value as 'rating' | 'price' | 'date')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sortBy === value
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {sortedClaims.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No pending claims</h4>
              <p className="text-gray-500 dark:text-gray-400">Your task is still waiting for helpers to claim it.</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {sortedClaims.map((claim) => (
                <div key={claim.id} className="border rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {claim.helperName.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{claim.helperName}</h4>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{claim.helperRating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{claim.helperCompletedTasks} tasks completed</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Proposed Fee</div>
                          <div className="text-lg font-bold text-green-600">£{claim.proposedFee}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Availability</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{claim.availability}</div>
                        </div>
                      </div>

                      {claim.notes && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Message</div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            &quot;{claim.notes}&quot;
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Claimed {formatTimeAgo(claim.createdAt)} • {claim.responseTime}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => onMessage(claim.helperId)}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            Message
                          </button>
                          <button
                            onClick={() => onRejectClaim(claim.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => onAcceptClaim(claim.id)}
                            className="px-4 py-1 text-xs bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Auto-Accept Settings</h4>
              <p className="text-xs text-gray-500">Automatically accept claims that meet your criteria</p>
            </div>
            <button className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg transition-colors">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};