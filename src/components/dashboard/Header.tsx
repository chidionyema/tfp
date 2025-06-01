"use client";
import React from "react";
import { Menu, Moon, Sun, Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSidebar: () => void;
  userRole: "requester" | "helper";
  onRoleChange: (role: "requester" | "helper") => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenSidebar,
  userRole,
  onRoleChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 border-b px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <h1 className="text-base sm:text-lg font-bold text-indigo-600">TaskForPerks</h1>
          <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-orange-100 text-orange-800 rounded text-xs">
            <Sparkles size={10} className="inline mr-0.5 sm:mr-1 sm:size-3" />
            <span className="hidden xs:inline">DEMO</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={onToggleDarkMode} 
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
          >
            {darkMode ? <Sun size={18} className="sm:size-5" /> : <Moon size={18} className="sm:size-5" />}
          </button>
          <button 
            onClick={onOpenSidebar} 
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
          >
            <Menu size={18} className="sm:size-5" />
          </button>
        </div>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 sm:p-1 mt-2 sm:mt-3">
        {[
          { role: "helper", label: "Find Tasks" },
          { role: "requester", label: "My Tasks" },
        ].map(({ role, label }) => (
          <button
            key={role}
            onClick={() => onRoleChange(role as "helper" | "requester")}
            className={`flex-1 py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium touch-manipulation ${
              userRole === role
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
};
