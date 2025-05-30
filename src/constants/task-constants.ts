// src/constants/task-constants.ts
//---------------------------------------------------------------
// Shared, **immutable** values for the Task-creation domain.
// No React imports or hooks – just data.
//---------------------------------------------------------------

// ─── Wizard ────────────────────────────────────────────────────
export const STEP_TITLES = [
    'Task Details',
    'Requirements & Photos',
    'Perk Selection',
    'Review & Publish',
  ] as const;
  
  // ─── Platform fees & rules ─────────────────────────────────────
  export const PLATFORM_FEE_RATE = 0.08;   // 8 %
  export const MIN_PERK_VALUE     = 5;     // USD
  
  // ─── Helper data factories ────────────────────────────────────
  import type {
    Category,
    UrgencyOption,
  } from '@/types/task';
  
  /** Returns a *fresh copy* of the category list (so callers can mutate). */
  export const getCategories = (): Category[] => [
    { id: 'delivery',  name: 'Delivery & Pickup', desc: 'Documents, packages, items', successRate: '96%', needsDropoff: true },
    { id: 'shopping',  name: 'Shopping & Errands', desc: 'Groceries, supplies, retail', successRate: '94%', needsDropoff: false },
    { id: 'transport', name: 'Transport & Rides',  desc: 'Airport, appointments, travel', successRate: '92%', needsDropoff: true },
    { id: 'personal',  name: 'Personal Care',      desc: 'Prescriptions, healthcare items', successRate: '90%', needsDropoff: false },
    { id: 'business',  name: 'Business Support',   desc: 'Printing, meetings, admin', successRate: '95%', needsDropoff: false },
    { id: 'other',     name: 'Other',              desc: 'Custom tasks and requests', successRate: '88%', needsDropoff: false },
  ];
  
  /** Returns a *fresh copy* of the urgency options. */
  export const getUrgencyOptions = (): UrgencyOption[] => [
    { id: 'low',       name: 'Low Priority',   desc: 'Within 24 hours',   color: 'bg-green-100 text-green-800',  multiplier: '1x perk value' },
    { id: 'medium',    name: 'Medium Priority',desc: 'Within 4-6 hours',  color: 'bg-yellow-100 text-yellow-800',multiplier: '1.2x appeal' },
    { id: 'high',      name: 'High Priority',  desc: 'Within 1-2 hours',  color: 'bg-orange-100 text-orange-800',multiplier: '1.5x appeal' },
    { id: 'emergency', name: 'Emergency',      desc: 'ASAP (≤ 30 min)',  color: 'bg-red-100 text-red-800',      multiplier: '2x appeal' },
  ];
  
 
  