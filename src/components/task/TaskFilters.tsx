// File: src/components/task/TaskFilters.tsx
import React from 'react';
import { Filter, Search } from 'lucide-react';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedUrgency: string;
  onUrgencyChange: (urgency: string) => void;
  locationFilter: string;
  onLocationChange: (location: string) => void;
  taskCount: number;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedUrgency,
  onUrgencyChange,
  locationFilter,
  onLocationChange,
  taskCount
}) => {
  const categories = ['all', 'delivery', 'shopping', 'transport', 'personal', 'business'];
  const urgencyLevels = ['all', 'emergency', 'high', 'medium', 'low'];
  const locationRanges = ['2km', '5km', '10km', '20km'];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <span className="font-medium text-gray-900">Filters:</span>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {urgencyLevels.map(urgency => (
              <option key={urgency} value={urgency}>
                {urgency === 'all' ? 'All Urgency' : urgency.charAt(0).toUpperCase() + urgency.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {locationRanges.map(range => (
              <option key={range} value={range}>Within {range}</option>
            ))}
          </select>

          <div className="text-sm text-gray-600 ml-2">
            {taskCount} tasks
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
