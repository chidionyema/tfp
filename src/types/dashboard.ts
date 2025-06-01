// types/dashboard.ts
import { Task, DbsRequirement, PerkItem } from "@/types/task";

export interface GeoPoint {
  address: string;
  lat: number;
  lng: number;
}

export type TaskStatus = 
  | "open" 
  | "claimed" 
  | "negotiating" 
  | "accepted" 
  | "in_progress" 
  | "completed" 
  | "disputed" 
  | "cancelled" 
  | "expired";

export type ClaimStatus = 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "withdrawn" 
  | "expired";

export interface TaskClaim {
  id: string;
  taskId: string;
  helperId: string;
  helperName: string;
  helperRating: number;
  helperCompletedTasks: number;
  proposedFee: number;
  notes: string;
  status: ClaimStatus;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  responseTime: string;
  availability: string;
}

export interface EnhancedTask extends Omit<Task, 'status' | 'location' | 'perks'> {
  status: TaskStatus;
  location: GeoPoint;
  claims: TaskClaim[];
  acceptedClaimId?: string;
  maxClaims: number;
  claimExpiryHours: number;
  autoAcceptBestClaim: boolean;
  autoAcceptCriteria: {
    minRating: number;
    maxFee: number;
    prioritizeRating: boolean;
  };
  updatedAt?: string;
  perks: PerkItem[];
}

export interface UserStats {
  tasksCompleted: number;
  rating: number;
  earnings: string;
  helpedPeople: number;
  dbClearance: DbsRequirement;
}

export interface RequesterTaskSummary {
  total: number;
  open: number;
  claimed: number;
  inProgress: number;
  completed: number;
  pendingClaims: number;
}

export interface PerkFromMock {
  value?: number;
  id?: string;
  description?: string;
  [key: string]: unknown;
}