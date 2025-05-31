// File: src/components/ui/LocationPicker.tsx
// Component: LocationPicker
// Type: Client Component (uses useState, geolocation APIs)
// Dependencies: lucide-react, react-map-gl (optional for maps)

"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Search, X, Navigation, Clock } from 'lucide-react';

export interface Location {
  id: string;
  address: string;
  lat: number;
  lng: number;
  type?: 'current' | 'recent' | 'search';
}

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  
  // Mock recent locations (in real app, get from localStorage/API)
  const [recentLocations] = useState<Location[]>([
    {
      id: '1',
      address: '123 Oxford Street, London W1C 1DP',
      lat: 51.5154,
      lng: -0.1416,
      type: 'recent'
    },
    {
      id: '2',
      address: 'London Bridge Station, London SE1 9SP',
      lat: 51.5052,
      lng: -0.0864,
      type: 'recent'
    },
    {
      id: '3',
      address: 'Canary Wharf, London E14 5AB',
      lat: 51.5055,
      lng: -0.0235,
      type: 'recent'
    }
  ]);

  // Mock search function (replace with actual geocoding API)
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockResults: Location[] = [
      {
        id: 'search1',
        address: `${query}, London, UK`,
        lat: 51.5074 + Math.random() * 0.1,
        lng: -0.1278 + Math.random() * 0.1,
        type: 'search'
      },
      {
        id: 'search2',
        address: `${query} Station, London, UK`,
        lat: 51.5074 + Math.random() * 0.1,
        lng: -0.1278 + Math.random() * 0.1,
        type: 'search'
      }
    ];
    
    setSearchResults(mockResults);
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Mock reverse geocoding (replace with actual API)
        const currentLocation: Location = {
          id: 'current',
          address: 'Current Location (London, UK)',
          lat: latitude,
          lng: longitude,
          type: 'current'
        };
        
        setSelectedLocation(currentLocation);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location.');
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-x-4 top-20 max-w-lg mx-auto bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin size={20} className="text-indigo-600" />
            Select Location
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for an address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Current Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="mt-3 w-full flex items-center gap-2 p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Navigation size={20} className="text-indigo-600" />
            <span className="font-medium text-gray-900">
              {isLoadingLocation ? 'Getting current location...' : 'Use current location'}
            </span>
          </button>
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-y-auto max-h-64">
          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Search Results</h4>
              {searchResults.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors mb-2 ${
                    selectedLocation?.id === location.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{location.address}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Locations */}
          {!searchQuery && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Clock size={16} />
                Recent Locations
              </h4>
              {recentLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors mb-2 ${
                    selectedLocation?.id === location.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{location.address}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchQuery && searchResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MapPin size={32} className="mx-auto mb-2 opacity-50" />
              <p>No locations found for &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>

        {/* Selected Location Preview */}
        {selectedLocation && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <MapPin size={16} className="text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Selected Location</p>
                <p className="text-sm text-gray-600">{selectedLocation.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t bg-white flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </>
  );
};

export default LocationPicker;