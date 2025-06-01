// StatsCard Component
"use client";
import React from "react";

interface StatsCardProps {
  value: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  onClick?: () => void;
  variant?: "default" | "action";
  children?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  value, 
  label, 
  icon: Icon,
  onClick,
  variant = "default",
  children
}) => {
  const baseClasses = "bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 sm:p-4 text-center transition-colors";
  const actionClasses = onClick ? "cursor-pointer hover:bg-white dark:hover:bg-gray-700 touch-manipulation" : "";
  const variantClasses = variant === "action" 
    ? "bg-indigo-600 hover:bg-indigo-700 text-white min-h-16 sm:min-h-20 flex flex-col items-center justify-center"
    : baseClasses;

  const content = children || (
    <>
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
        {Icon && (
          <Icon 
            size={16} 
            className={`sm:size-5 ${variant === "action" ? "text-white" : "text-blue-600"}`} 
          />
        )}
        <div className={`font-bold text-lg sm:text-xl ${variant === "action" ? "text-white" : "text-blue-600"}`}>
          {value}
        </div>
      </div>
      <div className={`text-xs ${
        variant === "action" 
          ? "text-white font-medium" 
          : "text-gray-600 dark:text-gray-400"
      }`}>
        {label}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`w-full h-full ${variantClasses} ${actionClasses}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={variantClasses}>
      {content}
    </div>
  );
};