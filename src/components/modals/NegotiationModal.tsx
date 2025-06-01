"use client";
import React, { useState } from "react";
import { X, Star, Activity } from "lucide-react";
import { EnhancedTask } from "@/types/dashboard";

interface NegotiationModalProps {
  taskTitle: string;
  task: EnhancedTask;
  onClose: () => void;
  onConfirm: (claimData: { fee: number; notes: string }) => void;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  taskTitle,
  task,
  onClose,
  onConfirm,
}) => {
  const [fee, setFee] = useState(20);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompetition, setShowCompetition] = useState(false);

  const otherClaims = task.claims.filter(c => c.status === 'pending').length;
  const bestCompetingClaim = task.claims
    .filter(c => c.status === 'pending')
    .sort((a, b) => b.helperRating - a.helperRating)[0];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onConfirm({ fee, notes });
    } catch (error) {
      console.error('Failed to submit claim:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl p-6 relative shadow-2xl border border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" disabled={isSubmitting}>
          <X size={20} />
        </button>
        
        <div className="mb-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <Star size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Submit Your Claim</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You have the required clearance for <span className="font-medium text-green-600">{taskTitle}</span>.
          </p>
          
          {otherClaims > 0 && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-amber-600" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {otherClaims} other helper{otherClaims > 1 ? 's have' : ' has'} claimed this task
                </span>
                <button onClick={() => setShowCompetition(!showCompetition)} className="text-xs text-amber-600 hover:text-amber-700 underline">
                  {showCompetition ? 'Hide' : 'View'}
                </button>
              </div>
              
              {showCompetition && bestCompetingClaim && (
                <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Top competitor: {bestCompetingClaim.helperRating.toFixed(1)}★ rating, £{bestCompetingClaim.proposedFee} fee
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Your Proposed Fee (£):</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
              <input 
                type="number" 
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors" 
                min="0"
                step="5"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Suggested: £15-25</span>
              {bestCompetingClaim && (
                <span className="text-amber-600">
                  Best competing offer: £{bestCompetingClaim.proposedFee}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Your Message:</label>
            <textarea 
              rows={3} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors resize-none" 
              placeholder="Why you're the best fit for this task..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{notes.length}/200</p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            ⏰ Your claim will expire in {task.claimExpiryHours} hours if not accepted by the requester.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors" disabled={isSubmitting}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors flex items-center gap-2">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting Claim...
              </>
            ) : (
              <>
                <Star size={16} />
                Submit Claim
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};