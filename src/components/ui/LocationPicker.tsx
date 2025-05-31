"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  MapPin,
  Search,
  X,
  Navigation,
  Clock,
  Zap,
  ChevronRight,
  Target,
  Wifi,
  WifiOff,
  CheckCircle2,
  ArrowRight,
  MapIcon,
  Globe,
  Compass,
} from "lucide-react";

export interface Location {
  id: string;
  address: string;
  lat: number;
  lng: number;
  type?: "current" | "recent" | "search" | "favorite" | "suggested";
  confidence?: number;
  category?: string;
  distance?: string;
  eta?: string;
  isVerified?: boolean;
}

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  className?: string;
  autoDetect?: boolean;
}

// ----------------------
// Static suggestions
// ----------------------
const SMART_SUGGESTIONS: Location[] = [
  {
    id: "suggest1",
    address: "Home (Westminster, London)",
    lat: 51.4994,
    lng: -0.1245,
    type: "suggested",
    confidence: 95,
    category: "Home",
    distance: "2.3 km",
    eta: "8 min",
    isVerified: true,
  },
  {
    id: "suggest2",
    address: "Office (Canary Wharf)",
    lat: 51.5055,
    lng: -0.0235,
    type: "suggested",
    confidence: 92,
    category: "Work",
    distance: "5.1 km",
    eta: "15 min",
    isVerified: true,
  },
];

const RECENT_LOCATIONS: Location[] = [
  {
    id: "recent1",
    address: "Oxford Circus Station, London W1B 3AG",
    lat: 51.5154,
    lng: -0.1416,
    type: "recent",
    confidence: 98,
    distance: "1.2 km",
    eta: "5 min",
    isVerified: true,
  },
  {
    id: "recent2",
    address: "London Bridge, London SE1 9SP",
    lat: 51.5052,
    lng: -0.0864,
    type: "recent",
    confidence: 96,
    distance: "3.4 km",
    eta: "12 min",
  },
  {
    id: "recent3",
    address: "Kings Cross Station, London N1C 4TB",
    lat: 51.5308,
    lng: -0.1238,
    type: "recent",
    confidence: 94,
    distance: "4.2 km",
    eta: "18 min",
  },
];

// ----------------------
// Type for Google Places Autocomplete predictions
// ----------------------
interface GooglePrediction {
  place_id: string;
  description: string;
}

// FRAMER-MOTION constants
const SPRING = { type: "spring", stiffness: 400, damping: 30 };
const MODAL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};
const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Helper function to generate unique ID without external library
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to ensure unique keys
const generateUniqueKey = (location: Location, index: number, prefix: string = '') => {
  const baseId = location.id || `fallback-${index}`;
  return `${prefix}${baseId}-${index}`;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
  className = "",
  autoDetect = true,
}) => {
  // ─── STATE ───────────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  // We generate a single session token per open picker session
  const sessionTokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (isOpen) {
      sessionTokenRef.current = generateUniqueId();
    } else {
      sessionTokenRef.current = null;
    }
  }, [isOpen]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 100], [1, 0.8]);

  // ─── ONLINE/OFFLINE LISTENER ─────────────────────────────────────────────────
  useEffect(() => {
    const fnOn = () => setIsOnline(true),
      fnOff = () => setIsOnline(false);
    window.addEventListener("online", fnOn);
    window.addEventListener("offline", fnOff);
    return () => {
      window.removeEventListener("online", fnOn);
      window.removeEventListener("offline", fnOff);
    };
  }, []);

  // ─── GEOLOCATION & REVERSE GEOCODING ─────────────────────────────────────────────
  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);

    if (!navigator.geolocation) {
      console.error("Geolocation unsupported");
      setLocationPermission("denied");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude, accuracy } }) => {
        try {
          // Use your API route instead of direct Google API call
          const geocodeUrl = `/api/geocoding?latlng=${latitude},${longitude}`;
          const res = await fetch(geocodeUrl);
          let formattedAddress = `Lat: ${latitude.toFixed(
            5
          )}, Lng: ${longitude.toFixed(5)} (approx)`;
          let isVerified = false;

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.results) && data.results.length > 0) {
              formattedAddress = data.results[0].formatted_address;
              isVerified = true;
            } else {
              console.warn(
                "Google Geocoding returned no results for current location."
              );
            }
          } else {
            console.error("Geocoding API error:", res.status, res.statusText);
          }

          setSelectedLocation({
            id: "current",
            address: formattedAddress,
            lat: latitude,
            lng: longitude,
            type: "current",
            confidence: Math.round(100 - (accuracy / 1000) * 10),
            distance: "0 km",
            eta: "Now",
            isVerified,
          });
        } catch (e) {
          console.error("Reverse geocode fetch failed:", e);
          setSelectedLocation({
            id: "current_fallback_fetch_error",
            address: `Lat: ${latitude.toFixed(
              5
            )}, Lng: ${longitude.toFixed(5)} (approx)`,
            lat: latitude,
            lng: longitude,
            type: "current",
            confidence: Math.round(100 - (accuracy / 1000) * 10),
            distance: "0 km",
            eta: "Now",
            isVerified: false,
          });
        } finally {
          setLocationPermission("granted");
          setIsLoadingLocation(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err.message, `(Code: ${err.code})`);
        setLocationPermission("denied");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const checkLocationPermission = useCallback(async () => {
    if (!("permissions" in navigator)) {
      getCurrentLocation();
      return;
    }
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      setLocationPermission(result.state);
      if (result.state === "granted") getCurrentLocation();
    } catch {
      console.warn("Permissions API fallback");
    }
  }, [getCurrentLocation]);

  // On open + autoDetect, ask permission
  useEffect(() => {
    if (
      isOpen &&
      autoDetect &&
      !selectedLocation &&
      locationPermission === "prompt"
    ) {
      checkLocationPermission();
    }
  }, [
    isOpen,
    autoDetect,
    selectedLocation,
    checkLocationPermission,
    locationPermission,
  ]);

  // ─── FOCUS SEARCH INPUT ON OPEN ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ─── GOOGLE PLACES AUTOCOMPLETE (UPDATED) ────────────────────────────────────────────────
  const searchLocations = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        // Use your API route instead of direct Google API call
        let url = `/api/places/autocomplete?input=${encodeURIComponent(q)}`;
        if (sessionTokenRef.current) {
          url += `&sessiontoken=${sessionTokenRef.current}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Places Autocomplete error:", {
              status: res.status,
              statusText: res.statusText,
              url: url,
              errorBody: errorText
            });
            setSearchResults([]);
            return;
          }
        
          const data = await res.json();
          console.log('API Response:', data); // Debug log
          
          // Check if there's an error in the response
          if (data.error) {
            console.error("API returned error:", data.error);
            setSearchResults([]);
            return;
          }
          
          if (!Array.isArray(data.predictions)) {
            console.warn("No predictions in response:", data);
            setSearchResults([]);
            return;
          }

        // Map each prediction into our Location type
        const mapped: Location[] = (data.predictions as GooglePrediction[]).map(
          (pred, index) => {
            const rawId = pred.place_id?.trim();
            const uniqueId = rawId && rawId.length > 0 ? rawId : `search-${index}-${generateUniqueId()}`;

            return {
              id: uniqueId,
              address: pred.description,
              lat: 0, // placeholder until we fetch details
              lng: 0,
              type: "search",
              confidence: undefined,
              isVerified: false,
            };
          }
        );
        setSearchResults(mapped);
      } catch (e) {
        console.error("Places Autocomplete fetch failed:", e);
        setSearchResults([]);
      }
    },
    []
  );

  // Fixed useEffect for debounced search
  useEffect(() => {
    const handle = window.setTimeout(() => searchLocations(searchQuery), 300);
    return () => {
      clearTimeout(handle);
    };
  }, [searchQuery, searchLocations]);

  // ─── HANDLE USER SELECTING A PREDICTION (UPDATED) ──────────────────────────────────────
  const handleLocationSelect = useCallback(
    async (loc: Location) => {
      setSelectedLocation(loc);
      if (!loc.id) return;

      try {
        // Use your API route instead of direct Google API call
        let detailsUrl = `/api/places/details?place_id=${loc.id}`;
        if (sessionTokenRef.current) {
          detailsUrl += `&sessiontoken=${sessionTokenRef.current}`;
        }
        
        const res = await fetch(detailsUrl);
        if (!res.ok) {
          console.error("Place Details error:", res.status, res.statusText);
          return;
        }
        
        const data = await res.json();
        if (data.status !== "OK" || !data.result) {
          console.warn("No details returned for place_id:", loc.id);
          return;
        }
        
        const result = data.result as {
          formatted_address: string;
          geometry: { location: { lat: number; lng: number } };
          place_id: string;
        };
        const { formatted_address, geometry } = result;

        const newLoc: Location = {
          id: result.place_id,
          address: formatted_address,
          lat: geometry.location.lat,
          lng: geometry.location.lng,
          type: "search",
          isVerified: true,
          confidence: 100,
        };

        setSelectedLocation(newLoc);
      } catch (e) {
        console.error("Place Details fetch failed:", e);
      }
    },
    []
  );

  // ─── CONFIRM BUTTON ────────────────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
      if ("vibrate" in navigator) navigator.vibrate([10, 50, 10]);
    }
  }, [selectedLocation, onLocationSelect, onClose]);

  // ─── LOCATION ITEM SUBCOMPONENT ───────────────────────────────────────────────
  interface LocationItemProps {
    location: Location;
    index: number;
    isSelected?: boolean;
    onClick: () => void;
  }
  const LocationItem: React.FC<LocationItemProps> = ({
    location,
    index,
    isSelected = false,
    onClick,
  }) => {
    const baseClasses =
      "w-full text-left p-4 rounded-2xl border-2 transition-all group relative overflow-hidden";
    const selectedClasses =
      "border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg scale-[1.02]";
    const defaultClasses =
      "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.01]";
    const iconBg =
      location.type === "current"
        ? "bg-green-100 text-green-600"
        : location.type === "suggested"
        ? "bg-purple-100 text-purple-600"
        : location.type === "recent"
        ? "bg-blue-100 text-blue-600"
        : "bg-gray-100 text-gray-600";

    return (
      <motion.button
        onClick={onClick}
        className={`${baseClasses} ${
          isSelected ? selectedClasses : defaultClasses
        }`}
        variants={ITEM_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay: index * 0.05, ...SPRING }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence>
          {isSelected && ( 
            <motion.div
              className="absolute right-4 top-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={SPRING}
            >
              <CheckCircle2 size={20} className="text-indigo-600" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-start gap-3 pr-8">
          <motion.div
            className={`p-2 rounded-xl ${iconBg}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {location.type === "current" ? (
              <Target size={16} />
            ) : location.type === "suggested" ? (
              <Zap size={16} />
            ) : location.type === "recent" ? (
              <Clock size={16} />
            ) : (
              <MapPin size={16} />
            )}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 truncate">
                {location.address}
              </p>
              {location.isVerified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0"
                >
                  <CheckCircle2 size={14} className="text-green-500" />
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {location.distance && (
                <span className="flex items-center gap-1">
                  <Compass size={12} />
                  {location.distance}
                </span>
              )}
              {location.eta && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {location.eta}
                </span>
              )}
              {location.confidence !== undefined && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    location.confidence > 90
                      ? "bg-green-100 text-green-800"
                      : location.confidence > 80
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {location.confidence}% match
                </span>
              )}
            </div>
            {location.category && (
              <motion.span
                className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {location.category}
              </motion.span>
            )}
          </div>
          <motion.div className="flex-shrink-0 text-gray-400" whileHover={{ x: 5 }}>
            <ChevronRight size={16} />
          </motion.div>
        </div>
      </motion.button>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className={`relative w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden ${className}`}
          variants={MODAL_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={SPRING}
          drag="y"
          dragConstraints={{ top: 0, bottom: 100 }}
          dragElastic={{ top: 0, bottom: 0.3 }}
          onDragEnd={(_, info) => info.offset.y > 100 && onClose()}
          style={{ y: dragY, opacity: dragOpacity }}
          aria-labelledby="location-picker-heading"
        >
          {/* ───────────────────────────────────────────────────────────── */}
          {/* HEADER */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-8 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-indigo-100 rounded-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <MapIcon size={20} className="text-indigo-600" />
                </motion.div>
                <div>
                  <h3
                    id="location-picker-heading"
                    className="font-bold text-gray-900"
                  >
                    Choose Location
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {isOnline ? (
                      <>
                        <Wifi size={12} className="text-green-500" /> Online
                      </>
                    ) : (
                      <>
                        <WifiOff size={12} className="text-red-500" /> Offline
                      </>
                    )}
                    {locationPermission === "granted" && (
                      <>
                        <Navigation size={12} className="text-blue-500" /> GPS
                        Enabled
                      </>
                    )}
                  </div>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close location picker"
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SEARCH BAR & "USE CURRENT LOCATION" BUTTON */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="relative">
              <motion.div
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  searchFocused ? "text-indigo-500" : "text-gray-400"
                }`}
                animate={{ scale: searchFocused ? 1.1 : 1 }}
              >
                <Search size={20} />
              </motion.div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search addresses, landmarks, or places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white"
                aria-label="Search for a location"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                    aria-label="Clear search query"
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={getCurrentLocation}
              disabled={
                isLoadingLocation || !isOnline || locationPermission === "denied"
              }
              className={`mt-4 w-full flex items-center gap-3 p-4 text-left border-2 rounded-2xl transition-all ${
                isLoadingLocation
                  ? "border-indigo-300 bg-indigo-50 cursor-wait"
                  : locationPermission === "denied"
                  ? "border-red-200 bg-red-50 text-red-700 cursor-not-allowed"
                  : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
              } disabled:opacity-70 disabled:cursor-not-allowed`}
              whileHover={{
                scale:
                  isLoadingLocation || locationPermission === "denied"
                    ? 1
                    : 1.02,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className={`p-2 rounded-xl ${
                  isLoadingLocation
                    ? "bg-indigo-200"
                    : locationPermission === "denied"
                    ? "bg-red-200"
                    : "bg-green-100"
                }`}
                animate={isLoadingLocation ? { rotate: 360 } : {}}
                transition={
                  isLoadingLocation
                    ? { duration: 1, repeat: Infinity, ease: "linear" }
                    : {}
                }
              >
                <Navigation
                  size={16}
                  className={
                    isLoadingLocation
                      ? "text-indigo-600"
                      : locationPermission === "denied"
                      ? "text-red-600"
                      : "text-green-600"
                  }
                />
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {isLoadingLocation
                    ? "Getting your location..."
                    : locationPermission === "denied"
                    ? "Location access denied"
                    : "Use current location"}
                </p>
                <p className="text-sm text-gray-600">
                  {isLoadingLocation
                    ? "This may take a few seconds"
                    : locationPermission === "denied"
                    ? "Enable location access in browser settings"
                    : "Automatically detect where you are"}
                </p>
              </div>
              {isLoadingLocation && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"
                  role="status"
                  aria-label="Loading current location"
                />
              )}
            </motion.button>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SEARCH RESULTS + RECENT LOCATIONS + SUGGESTIONS */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto max-h-80" tabIndex={0} aria-live="polite">
            <AnimatePresence mode="wait">
              {/* Smart Suggestions */}
              {!searchQuery && showSuggestions && SMART_SUGGESTIONS.length > 0 && (
                <motion.div
                  key="smart-suggestions"
                  className="p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Zap size={16} className="text-purple-600" />
                      Smart Suggestions
                    </h4>
                    <motion.button
                      onClick={() => setShowSuggestions(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                      whileHover={{ scale: 1.05 }}
                      aria-label="Hide smart suggestions"
                    >
                      Hide
                    </motion.button>
                  </div>
                  <motion.div
                    className="space-y-3"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="visible"
                  >
                    {SMART_SUGGESTIONS.map((loc, i) => (
                      <LocationItem
                        key={generateUniqueKey(loc, i, 'suggestion-')}
                        location={loc}
                        index={i}
                        isSelected={selectedLocation?.id === loc.id}
                        onClick={() => handleLocationSelect(loc)}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Search Results */}
              {searchQuery && searchResults.length > 0 && (
                <motion.div
                  key="search-results"
                  className="p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Search size={16} className="text-blue-600" />
                    Search Results ({searchResults.length})
                  </h4>
                  <motion.div
                    className="space-y-3"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="visible"
                  >
                    {searchResults.map((loc, i) => (
                      <LocationItem
                        key={generateUniqueKey(loc, i, 'search-')}
                        location={loc}
                        index={i}
                        isSelected={selectedLocation?.id === loc.id}
                        onClick={() => handleLocationSelect(loc)}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Recent Locations */}
              {!searchQuery && RECENT_LOCATIONS.length > 0 && (
                <motion.div
                  key="recent-locations"
                  className="p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-gray-600" />
                    Recent Locations
                  </h4>
                  <motion.div
                    className="space-y-3"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="visible"
                  >
                    {RECENT_LOCATIONS.map((loc, i) => (
                      <LocationItem
                        key={generateUniqueKey(loc, i, 'recent-')}
                        location={loc}
                        index={i}
                        isSelected={selectedLocation?.id === loc.id}
                        onClick={() => handleLocationSelect(loc)}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* No results */}
              {searchQuery && searchResults.length === 0 && !isLoadingLocation && (
                <motion.div
                  key="no-results"
                  className="p-12 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                  </motion.div>
                  <p className="text-gray-600 font-medium">No locations found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try searching for a different address or landmark.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SELECTED LOCATION FOOTER */}
          {/* ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {selectedLocation && (
              <motion.div
                key="selected-location-footer"
                className="border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={SPRING}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="p-2 bg-indigo-100 rounded-xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <CheckCircle2 size={16} className="text-indigo-600" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-indigo-900">
                      Selected Location
                    </p>
                    <p
                      className="text-sm text-gray-700 truncate"
                      title={selectedLocation.address}
                    >
                      {selectedLocation.address}
                    </p>
                  </div>
                  {selectedLocation.eta && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">ETA</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedLocation.eta}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* ACTION BUTTONS */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="p-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm flex gap-3">
            <motion.button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className={`flex-1 px-6 py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                selectedLocation
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={selectedLocation ? { scale: 1.02 } : {}}
              whileTap={selectedLocation ? { scale: 0.98 } : {}}
            >
              {selectedLocation ? (
                <>
                  Confirm Location
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={16} />
                  </motion.div>
                </>
              ) : (
                "Select a location"
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocationPicker;