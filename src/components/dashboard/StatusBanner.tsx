"use client";
import React from "react";
import { Search, Users, Star } from "lucide-react";

interface StatusBannerProps {
  type: "waiting" | "claimed" | "accepted";
  count?: number;
  helperName?: string;
  helperFee?: number;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  type,
  count = 0,
  helperName,
  helperFee,
}) => {
  const getBannerContent = () => {
    switch (type) {
      case "waiting":
        return {
          icon: <Search size={16} className="text-blue-600" />,
          bgClass: "bg-blue-50 dark:bg-blue-900/20",
          textClass: "text-blue-700 dark:text-blue-300",
          message: "Waiting for helpers to claim",
        };
      case "claimed":
        return {
          icon: <Users size={16} className="text-amber-600" />,
          bgClass: "bg-amber-50 dark:bg-amber-900/20",
          textClass: "text-amber-700 dark:text-amber-300",
          message: `${count} helper${count !== 1 ? 's' : ''} claimed this task`,
        };
      case "accepted":
        return {
          icon: <Star size={16} className="text-green-600" />,
          bgClass: "bg-green-50 dark:bg-green-900/20",
          textClass: "text-green-700 dark:text-green-300",
          message: `Accepted ${helperName}${helperFee ? ` (£${helperFee})` : ''}`,
        };
      default:
        return {
          icon: null,
          bgClass: "",
          textClass: "",
          message: "",
        };
    }
  };

  const { icon, bgClass, textClass, message } = getBannerContent();

  return (
    <div className={`flex items-center gap-2 mb-4 p-3 ${bgClass} rounded-lg`}>
      {icon}
      <span className={`text-sm ${textClass}`}>
        {message}
      </span>
    </div>
  );
};