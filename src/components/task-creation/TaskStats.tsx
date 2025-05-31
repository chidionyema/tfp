// ==================================
// components/task-creation/TaskStats.tsx
// ==================================

"use client";
interface Props {
  successRate: number;
  totalValue: number;
  combo: boolean;
}
export const TaskStats: React.FC<Props> = ({ successRate, totalValue, combo }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center bg-gray-50 rounded-lg p-3">
    <div>
      <p className="text-xl font-bold text-green-600">{successRate}%</p>
      <p className="text-xs text-gray-600">Success Rate</p>
    </div>
    <div>
      <p className="text-xl font-bold text-blue-600">8 min</p>
      <p className="text-xs text-gray-600">Avg Claim Time</p>
    </div>
    <div>
      <p className="text-xl font-bold text-blue-600">{Math.max(1, Math.floor(totalValue / 15) + (combo ? 1 : 0))}</p>
      <p className="text-xs text-gray-600">Expected Helpers</p>
    </div>
    <div>
      <p className="text-xl font-bold text-purple-600">${totalValue.toFixed(0)}</p>
      <p className="text-xs text-gray-600">Total Value</p>
    </div>
  </div>
);
