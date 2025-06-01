// SidebarProfile Component
"use client";
import React from "react";
import { AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { StatsCard } from "./StatsCard";

interface UserStats {
  tasksCompleted: number;
  rating: number;
  earnings: string;
  helpedPeople: number;
}

interface BackgroundCheckData {
  personalInfo: {
    level?: string;
  };
}

interface SidebarProfileProps {
  showSidebar: boolean;
  onCloseSidebar: () => void;
  userStats: UserStats;
  backgroundCheckData: BackgroundCheckData | null;
}

const VerificationBadge = ({ status }: { status: string }) => {
  const config = status === "completed" 
    ? { bg: "bg-green-100", color: "text-green-800", text: "Verified" }
    : { bg: "bg-gray-100", color: "text-gray-600", text: "Not Verified" };
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${config.bg} ${config.color}`}>
      {config.text}
    </div>
  );
};

export const SidebarProfile: React.FC<SidebarProfileProps> = ({
  showSidebar,
  onCloseSidebar,
  userStats,
  backgroundCheckData,
}) => {
  return (
    <AnimatePresence>
      {showSidebar && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={onCloseSidebar} />
          <div className="fixed right-0 top-0 h-full w-full sm:w-80 max-w-sm bg-white dark:bg-gray-800 shadow-xl p-4 sm:p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold">Profile</h2>
              <button onClick={onCloseSidebar} className="p-1 touch-manipulation">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4 mb-4">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  JD
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">John Doe</h3>
                  <VerificationBadge status={backgroundCheckData ? "completed" : "none"} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <StatsCard 
                  value={userStats.tasksCompleted.toString()} 
                  label="Tasks Done" 
                />
                <StatsCard 
                  value={userStats.rating.toString()} 
                  label="Rating" 
                />
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4">
                <h4 className="font-medium mb-2 text-sm sm:text-base">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Earnings</span>
                    <span className="font-medium">{userStats.earnings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">People Helped</span>
                    <span className="font-medium">{userStats.helpedPeople}</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base touch-manipulation">
                View Full Profile
              </button>
              
              <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base touch-manipulation">
                Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};