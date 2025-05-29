"use client"; // Assuming this component might be used in client-side contexts or have client interactions
import React from 'react';
import { MapPin, Clock } from 'lucide-react'; // Removed unused Star, TrendingUp

// Assumed Task type definition (replace with your actual import from '@/lib/types')
interface PerkInTask {
  description?: string;
  successRate?: string | number;
  // Add other perk properties if used or needed for type safety
}
export interface Task {
  id: string | number;
  title: string;
  urgency: 'emergency' | 'high' | 'medium' | 'low' | string; // Flexible urgency type
  successRate: string | number; // e.g., "96%" or 96
  description: string;
  location: string;
  estimatedDuration: string;
  perks: PerkInTask[];
  tier: string | number;
  // Add other fields as necessary
}
// End of assumed Task type definition

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showClaimButton?: boolean;
  onClaim?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onClick, 
  showClaimButton = true, 
  onClaim 
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) { // Normalize to lowercase for safety
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      onClick();
    }
  };

  const firstPerk = task.perks && task.perks.length > 0 ? task.perks[0] : null;

  return (
    <div 
      className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
      onClick={onClick}
      onKeyDown={handleKeyPress}
      role={onClick ? "button" : undefined} // Role="button" if clickable
      tabIndex={onClick ? 0 : undefined}    // tabIndex="0" if clickable
      aria-label={onClick ? `View details for task: ${task.title}` : undefined}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0"> {/* Added min-w-0 for better flex handling of long text */}
          <div className="flex items-center flex-wrap gap-2 mb-2"> {/* Use flex-wrap for smaller screens */}
            <h3 className="text-lg font-semibold text-gray-900 truncate">{task.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(task.urgency)}`}>
              {task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              {typeof task.successRate === 'number' ? `${task.successRate}%` : task.successRate} success
            </span>
          </div>
          
          <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{task.description}</p>
          
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin size={16} aria-hidden="true" />
              <span>{task.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} aria-hidden="true" />
              <span>{task.estimatedDuration}</span>
            </div>
          </div>
        </div>
        
        {firstPerk && (
          <div className="text-right ml-4 flex-shrink-0"> {/* flex-shrink-0 to prevent shrinking */}
            <div className="text-lg font-bold text-indigo-600 mb-1 truncate" title={firstPerk.description}>
              {firstPerk.description || "Perk"}
            </div>
            <div className="text-xs text-gray-500">
              Tier {task.tier} {firstPerk.successRate ? `• ${typeof firstPerk.successRate === 'number' ? `${firstPerk.successRate}%` : firstPerk.successRate} rate` : ''}
            </div>
          </div>
        )}
      </div>
      
      {showClaimButton && onClaim && ( // Ensure onClaim is provided if showClaimButton is true
        <div className="flex justify-end pt-4 border-t mt-4">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card's onClick if it exists
              onClaim();
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            aria-label={`Claim task: ${task.title}`}
          >
            Claim Task
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;