/**
 * Domain-level TypeScript interfaces shared by the Task-creation feature.
 * Pure data – no runtime code. Safe to move/rename without breaking behaviour.
 */

/* -------------------------------------------------------------------------- */
/*  Task Perks                                                                */
/* -------------------------------------------------------------------------- */
export interface Task {
    id: string
    title: string
    description: string
    location: string
    category: string
    urgency: string
    status: string
    createdAt: string
    estimatedDuration: string
    requesterId: string
    perks: PerkItem[]
    tier: number
    successRate: number
  }
export interface PerkItem {
    id: string;
    type: 'payment' | 'good' | 'service';
  
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
    condition?: 'new' | 'like-new' | 'good';
    photos?: string[];
  
    /* Fulfilment & escrow */
    escrowMethod?: 'digital' | 'physical' | 'service_mediation';
    deliveryMethod?: 'ship_to_platform' | 'local_handoff' | 'direct_delivery';
    verificationRequired?: boolean;
  }
  
  /* -------------------------------------------------------------------------- */
  /*  Task-form root object                                                     */
  /* -------------------------------------------------------------------------- */
  
  export interface TaskFormData {
    /* Basics */
    title: string;
    description: string;
    category: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
  
    /* Locations */
    location: GeoPoint | null;
    dropoffLocation: GeoPoint | null;
    needsDropoff: boolean;
  
    /* Extras */
    estimatedDuration: string;          // e.g. "1.5hours"
    specificRequirements: string;       // free-text
    allowNegotiation: boolean;
  
    /* Perks & media */
    perks: PerkItem[];
    photos: File[];
  }
  
  /* -------------------------------------------------------------------------- */
  /*  Lookup / option helpers                                                   */
  /* -------------------------------------------------------------------------- */
  
  export interface Category {
    id: string;
    name: string;
    desc: string;
    successRate: string;   // e.g. "96%"
    needsDropoff: boolean;
  }
  
  export interface UrgencyOption {
    id: string;
    name: string;
    desc: string;
    color: string;         // Tailwind classes
    multiplier: string;    // e.g. "1.2x appeal"
  }
  
  export interface BaseSelectOption {
    id: string;
  }
  
  /* -------------------------------------------------------------------------- */
  /*  Reusable primitives                                                       */
  /* -------------------------------------------------------------------------- */
  
  /** Shared “lat/lng + address” structure used across the app */
  export interface GeoPoint {
    address: string;
    lat: number;
    lng: number;
  }
  