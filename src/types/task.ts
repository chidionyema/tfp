/**
 * Domain-level TypeScript interfaces shared by the Task-creation feature.
 * Pure data – no runtime code. Safe to move/rename without breaking behaviour.
 */

/* ------------------------------------------------------------------------ */
/*  Enums & top-level entities                                              */
/* ------------------------------------------------------------------------ */

/** Where (and how) a task is executed. */
export type TaskMode = "physical" | "online" | "hybrid";

/** DBS (Disclosure and Barring Service) check requirements */
export type DbsRequirement = "none" | "basic" | "standard" | "enhanced";

/** Persisted Task record returned by the API. */
export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: "low" | "medium" | "high" | "emergency";
  mode: TaskMode;                 // ← NEW
  status: string;
  createdAt: string;
  estimatedDuration: string;
  requesterId: string;
  updatedAt?:  string;
  /* Locations (only relevant when mode includes physical) */
  location?: GeoPoint | null;
  dropoffLocation?: GeoPoint | null;

  /* Background checks & verification */
  dbsRequirement: DbsRequirement;  // ← NEW

  /* Perks & scoring */
  perks: PerkItem[];
  tier: number;
  successRate: number;
}

/* ------------------------------------------------------------------------ */
/*  Task Perks                                                              */
/* ------------------------------------------------------------------------ */

export interface PerkItem {
  id: string;
  type: "payment" | "good" | "service";

  /* Display & helper info */
  name: string;
  description: string;

  /* Monetary / intrinsic value */
  estimatedValue: number;
  customValue?: number;

  /* Physical-good metadata */
  quantity?: number;
  brand?: string;
  model?: string;
  condition?: "new" | "like-new" | "good";
  photos?: string[];

  /* Fulfilment & escrow */
  escrowMethod?: "digital" | "physical" | "service_mediation";
  deliveryMethod?:
    | "ship_to_platform"
    | "local_handoff"
    | "direct_delivery";
  verificationRequired?: boolean;
}

/* ------------------------------------------------------------------------ */
/*  Task-form root object (wizard state)                                    */
/* ------------------------------------------------------------------------ */

export interface TaskFormData {
    /* Basics */
    title: string;
    description: string;
    category: string;
    urgency: "low" | "medium" | "high" | "emergency";
    mode: TaskMode;
  
    /* Locations (optional when mode excludes physical) */
    location: GeoPoint | null;
    requiresPickup: boolean;           // ← NEW ­(helper must visit a pickup site)
    dropoffLocation: GeoPoint | null;
    needsDropoff: boolean;             // category-driven helper
  
    /* Extras */
    estimatedDuration: string;         // e.g. "1.5h"
    specificRequirements: string;
    allowNegotiation: boolean;
    escrowAgreed: boolean; 
    
    /* Background check requirements */
    dbsRequirement: DbsRequirement;    // ← NEW
    
    /* Online-only extras (optional) */
    meetingLink?: string;              // Zoom/Teams/etc.
  
    /* Perks & media */
    perks: PerkItem[];
    photos: File[];
}

/* ------------------------------------------------------------------------ */
/*  DBS-related interfaces                                                  */
/* ------------------------------------------------------------------------ */

export interface DbsOption {
  id: DbsRequirement;
  name: string;
  description: string;
  fee: number;
  processingTime: string;
}

export interface DbsCostBreakdown {
  perkValue: number;
  dbsFee: number;
  platformFee: number;
  total: number;
}

/* ------------------------------------------------------------------------ */
/*  Lookup / option helpers                                                 */
/* ------------------------------------------------------------------------ */

export interface Category {
  id: string;
  name: string;
  desc: string;
  successRate: string;               // e.g. "96%"
  needsDropoff: boolean;
  suggestedDbsLevel?: DbsRequirement; // ← NEW: suggested DBS level for this category
}

export interface UrgencyOption {
  id: string;
  name: string;
  desc: string;
  color: string;                     // Tailwind classes
  multiplier: string;                // e.g. "1.2x appeal"
}

export interface BaseSelectOption {
  id: string;
}

/* ------------------------------------------------------------------------ */
/*  Reusable primitives                                                     */
/* ------------------------------------------------------------------------ */

/** Shared "lat/lng + address" structure used across the app */
export interface GeoPoint {
  address: string;
  lat: number;
  lng: number;
}

/* ------------------------------------------------------------------------ */
/*  DBS utility constants and functions                                     */
/* ------------------------------------------------------------------------ */

/** DBS fee schedule (in GBP) */
export const DBS_FEES = {
  none: 0,
  basic: 18,
  standard: 38,
  enhanced: 44
} as const;

/** DBS processing times */
export const DBS_PROCESSING_TIMES = {
  none: "N/A",
  basic: "2-4 weeks",
  standard: "2-4 weeks", 
  enhanced: "4-6 weeks"
} as const;

/* ------------------------------------------------------------------------ */
/*  DBS utility functions                                                   */
/* ------------------------------------------------------------------------ */

/** Calculate DBS fee for a given requirement level */
export const calculateDbsFee = (requirement: DbsRequirement): number => {
  return DBS_FEES[requirement] || 0;
};

/** Get processing time for a DBS requirement level */
export const getDbsProcessingTime = (requirement: DbsRequirement): string => {
  return DBS_PROCESSING_TIMES[requirement] || "Unknown";
};

/** Check if task requires enhanced verification */
export const requiresEnhancedVerification = (data: TaskFormData): boolean => {
  return data.dbsRequirement === "enhanced" || data.dbsRequirement === "standard";
};

/** Calculate total task cost including DBS fees */
export const calculateTotalTaskCost = (data: TaskFormData): DbsCostBreakdown => {
  const perkValue = data.perks?.reduce((sum, perk) => {
    return sum + ((perk.customValue ?? perk.estimatedValue) * (perk.quantity || 1));
  }, 0) || 0;
  
  const dbsFee = calculateDbsFee(data.dbsRequirement || "none");
  const platformFee = perkValue * 0.05; // 5% platform fee
  const total = perkValue + dbsFee + platformFee;
  
  return {
    perkValue,
    dbsFee,
    platformFee,
    total
  };
};

/** Get minimum suggested perk value based on DBS requirement */
export const getMinimumPerkValue = (dbsRequirement: DbsRequirement): number => {
  switch (dbsRequirement) {
    case "enhanced":
      return 50;
    case "standard":
      return 40;
    case "basic":
      return 30;
    case "none":
    default:
      return 20;
  }
};

/** Check if perk value is appropriate for DBS requirement */
export const isPerkValueAppropriate = (perkValue: number, dbsRequirement: DbsRequirement): boolean => {
  const minimumValue = getMinimumPerkValue(dbsRequirement);
  return perkValue >= minimumValue;
};

/** Get DBS requirement display color */
export const getDbsRequirementColor = (requirement: DbsRequirement): string => {
  switch (requirement) {
    case "enhanced":
      return "bg-red-100 text-red-800";
    case "standard":
      return "bg-amber-100 text-amber-800";
    case "basic":
      return "bg-blue-100 text-blue-800";
    case "none":
    default:
      return "bg-gray-100 text-gray-800";
  }
};