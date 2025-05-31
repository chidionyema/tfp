/**
 * Domain-level TypeScript interfaces shared by the Task-creation feature.
 * Pure data – no runtime code. Safe to move/rename without breaking behaviour.
 */

/* ------------------------------------------------------------------------ */
/*  Enums & top-level entities                                              */
/* ------------------------------------------------------------------------ */

/** Where (and how) a task is executed. */
export type TaskMode = "physical" | "online" | "hybrid";

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

  /* Locations (only relevant when mode includes physical) */
  location?: GeoPoint | null;
  dropoffLocation?: GeoPoint | null;

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
    /* Online-only extras (optional) */
    meetingLink?: string;              // Zoom/Teams/etc.
  
    /* Perks & media */
    perks: PerkItem[];
    photos: File[];
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

/** Shared “lat/lng + address” structure used across the app */
export interface GeoPoint {
  address: string;
  lat: number;
  lng: number;
}
