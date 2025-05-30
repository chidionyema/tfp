// src/utils/task-utils.ts
//---------------------------------------------------------------
//  Stateless helpers for the Task-creation feature
//---------------------------------------------------------------

import type { PerkItem, Category } from '@/types/task';
import { PLATFORM_FEE_RATE, MIN_PERK_VALUE } from '@/constants/task-constants';

/* ────────────────────────────────────────────────────────────── */
/*  Perk & fee helpers                                            */
/* ────────────────────────────────────────────────────────────── */

export function calculateTotalPerkValue(perks: PerkItem[]): number {
  return perks.reduce(
    (total, p) => total + ((p.customValue ?? p.estimatedValue) * (p.quantity || 1)),
    0,
  );
}

export function calculatePlatformFee(perks: PerkItem[]): number {
  return Math.round(calculateTotalPerkValue(perks) * PLATFORM_FEE_RATE * 100) / 100;
}

export function isCombinationPerk(perks: PerkItem[]): boolean {
  return new Set(perks.map((p) => p.type)).size > 1;
}

export function getCombinationBonus(perks: PerkItem[]): number {
  return isCombinationPerk(perks) ? 4 : 0;
}

/* ────────────────────────────────────────────────────────────── */
/*  Success-rate estimator                                        */
/* ────────────────────────────────────────────────────────────── */

export function estimatedSuccessRate(
  perks: PerkItem[],
  categoryId: string,
  urgency: 'low' | 'medium' | 'high' | 'emergency',
  categories: Category[],
): number {
  let rate = 85;

  const cat = categories.find((c) => c.id === categoryId);
  if (cat) rate += parseInt(cat.successRate) - 85;

  if (urgency === 'emergency') rate += 5;
  else if (urgency === 'high') rate += 3;

  const total = calculateTotalPerkValue(perks);
  if (total >= 30) rate += 8;
  else if (total >= 20) rate += 5;
  else if (total >= 15) rate += 3;

  if (isCombinationPerk(perks)) rate += getCombinationBonus(perks);

  return Math.min(rate, 98);
}

/* ────────────────────────────────────────────────────────────── */
/*  UI helpers                                                    */
/* ────────────────────────────────────────────────────────────── */

import { DollarSign } from 'lucide-react';
import React from 'react';

export function getPerkIcon(type: PerkItem['type']) {
  switch (type) {
    case 'payment':
      return <DollarSign size={20} className="text-green-600" aria-hidden="true" />;
    case 'good':
      return <span className="text-xl" role="img" aria-label="Physical good">📱</span>;
    case 'service':
      return <span className="text-xl" role="img" aria-label="Service">🚗</span>;
    default:
      return <span className="text-xl" role="img" aria-label="Perk">🎁</span>;
  }
}

/** Returns note colour + copy for goods-delivery explanations */
export function getDeliveryInfo(
  method?: PerkItem['deliveryMethod'],
): { text: string; color: string } | null {
  if (!method || method === 'local_handoff') return null;
  return method === 'ship_to_platform'
    ? {
        text:
          "You'll ship the item to our secure facility. We verify & hold it until completion " +
          '(handling fee $5-15).',
        color: 'blue',
      }
    : {
        text:
          'You deliver directly to the helper. Both parties get reduced dispute protection.',
        color: 'amber',
      };
}

/* ────────────────────────────────────────────────────────────── */
/*  Validation helpers                                            */
/* ────────────────────────────────────────────────────────────── */

export function meetsMinPerkValue(perks: PerkItem[]): boolean {
  return calculateTotalPerkValue(perks) >= MIN_PERK_VALUE;
}
