// File: src/lib/types.ts
// TypeScript type definitions for TaskForPerks

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  joinDate: string;
  tasksCompleted: number;
}
export type DbsLevel = "none" | "basic" | "standard" | "enhanced";

export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'claimed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedDuration: string;
  requirements?: string[];
  photos?: string[];
  requesterId: string;
  helperId?: string;
  perks: Perk[];
  tier: number;
  successRate: number;
  dbsRequirement: DbsLevel;
}

export interface Perk {
  id: string;
  type: 'cash' | 'gift_card' | 'tech_item' | 'service' | 'credits';
  value: number;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  successRate: number;
  availability: 'instant' | 'within_24h' | 'custom';
}

export interface Negotiation {
  id: string;
  taskId: string;
  offers: NegotiationOffer[];
  status: 'open' | 'accepted' | 'rejected' | 'expired';
}

export interface NegotiationOffer {
  id: string;
  fromUserId: string;
  proposedPerks: Perk[];
  message?: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}
