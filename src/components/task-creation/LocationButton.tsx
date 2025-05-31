// ==================================
// components/task-creation/LocationButton.tsx
// ==================================

"use client";
import { MapPin } from "lucide-react";
interface Location {
  address: string;
  lat: number;
  lng: number;
}
interface Props {
  location: Location | null;
  onClick: () => void;
  label: string;
  icon?: "indigo" | "green";
}
export const LocationButton: React.FC<Props> = ({ location, onClick, label, icon = "indigo" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={location ? `Change ${label}: ${location.address}` : `Set ${label}`}
    className={`w-full p-3 border-2 border-dashed rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
      location ? `border-${icon}-300 bg-${icon}-50` : "border-gray-300 hover:border-gray-400"
    }`}
  >
    <div className="flex items-center gap-2">
      <MapPin size={20} className={location ? `text-${icon}-600` : "text-gray-400"} />
      <div>
        <p className="font-medium text-gray-900 text-sm">{location ? `${label} Set` : `Set ${label}`}</p>
        <p className="text-xs text-gray-600">
          {location?.address || `Click to select ${label.toLowerCase()}`}
        </p>
      </div>
    </div>
  </button>
);
