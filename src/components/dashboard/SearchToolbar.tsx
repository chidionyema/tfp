// SearchToolbar Component
"use client";
import React, { useRef } from "react";
import { Search, Filter, X } from "lucide-react";

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchFocused: boolean;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  searchFocused,
  onSearchFocus,
  onSearchBlur,
  searchInputRef,
}) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = searchInputRef || internalRef;

  return (
    <div className="px-3 py-2 sm:px-4 sm:py-3 bg-white dark:bg-gray-800 border-b">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 transition-all duration-200 text-sm touch-manipulation ${
              searchFocused ? 'ring-2 ring-indigo-500 border-indigo-300' : ''
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button className="px-2.5 sm:px-3 py-2.5 sm:py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 touch-manipulation">
          <Filter size={14} />
        </button>
      </div>
    </div>
  );
};