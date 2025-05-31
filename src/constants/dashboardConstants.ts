// File: src/constants/dashboardConstants.ts
// Purpose: Constants and mock data for dashboard

import { CheckCircle2, AlertTriangle, Clock, Shield, Activity, LucideIcon } from 'lucide-react';

// Type definitions
export interface MockTask {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  urgency: string;
  perks: Array<{ value: number }>;
  requiresBackgroundCheck?: boolean;
}

export interface MockActiveTask {
  id: string;
  title: string;
  status: string;
  helper: string;
  timeRemaining: string;
  perk: string;
}

export interface BadgeConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  text: string;
}

export interface UIConfig {
  colors: {
    green: string;
    blue: string;
    purple: string;
    gray: string;
  };
  urgencyColors: {
    emergency: string;
    high: string;
    medium: string;
    low: string;
  };
  categories: Array<{ value: string; label: string }>;
  urgencies: Array<{ value: string; label: string }>;
}

// Mock data
export const MOCK_TASKS: MockTask[] = [
  { 
    id: '1', 
    title: 'Emergency Document Delivery', 
    description: 'Need passport collected from home and delivered to embassy before 3PM today.', 
    location: 'Camden, London • 1.2 km', 
    category: 'delivery', 
    urgency: 'emergency',
    perks: [{ value: 75 }],
    requiresBackgroundCheck: true
  },
  { 
    id: '2', 
    title: 'Laptop Charger Emergency', 
    description: 'MacBook Pro charger needed urgently for client presentation.', 
    location: 'Canary Wharf, London • 2.1 km', 
    category: 'shopping', 
    urgency: 'high',
    perks: [{ value: 25 }]
  },
  { 
    id: '3', 
    title: 'Child School Pickup', 
    description: 'Emergency pickup of my 8-year-old from school. ID verification required.', 
    location: 'Westminster, London • 3.5 km', 
    category: 'personal', 
    urgency: 'emergency',
    perks: [{ value: 90 }],
    requiresBackgroundCheck: true
  },
  { 
    id: '4', 
    title: 'Pet Walking Service', 
    description: 'Need someone to walk my golden retriever for 1 hour in Hyde Park.', 
    location: 'Hyde Park, London • 0.8 km', 
    category: 'personal', 
    urgency: 'low',
    perks: [{ value: 20 }]
  },
  { 
    id: '5', 
    title: 'Senior Care Assistant', 
    description: 'Help elderly person with daily tasks. DBS check required.', 
    location: 'Shoreditch, London • 2.3 km', 
    category: 'personal', 
    urgency: 'medium',
    perks: [{ value: 120 }],
    requiresBackgroundCheck: true
  },
  { 
    id: '6', 
    title: 'Office Setup Help', 
    description: 'Need help setting up desk and tech equipment in new office space.', 
    location: 'King\'s Cross, London • 3.1 km', 
    category: 'handyman', 
    urgency: 'low',
    perks: [{ value: 50 }]
  }
];

export const MOCK_ACTIVE_TASKS: MockActiveTask[] = [
  { 
    id: 'active1', 
    title: 'Business Cards Printing', 
    status: 'in_progress', 
    helper: 'Sarah M.', 
    timeRemaining: '25 min', 
    perk: '£30 PayPal' 
  },
  { 
    id: 'active2', 
    title: 'Grocery Shopping', 
    status: 'accepted', 
    helper: 'Mike R.', 
    timeRemaining: '45 min', 
    perk: '£35 Amazon card' 
  }
];

export const UI_CONFIG: UIConfig = {
  colors: {
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    gray: 'text-gray-600 dark:text-gray-400'
  },
  urgencyColors: {
    emergency: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  },
  categories: [
    { value: 'all', label: 'All Categories' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'personal', label: 'Personal' },
    { value: 'handyman', label: 'Handyman' },
    { value: 'creative', label: 'Creative' },
    { value: 'education', label: 'Education' }
  ],
  urgencies: [
    { value: 'all', label: 'All Urgency' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]
};

export const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  completed: { 
    icon: CheckCircle2, 
    color: 'text-green-600 dark:text-green-400', 
    bg: 'bg-green-100 dark:bg-green-900/30', 
    text: 'Verified' 
  },
  pending: { 
    icon: Clock, 
    color: 'text-yellow-600 dark:text-yellow-400', 
    bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
    text: 'Pending' 
  },
  in_progress: { 
    icon: Activity, 
    color: 'text-blue-600 dark:text-blue-400', 
    bg: 'bg-blue-100 dark:bg-blue-900/30', 
    text: 'In Progress' 
  },
  failed: { 
    icon: AlertTriangle, 
    color: 'text-red-600 dark:text-red-400', 
    bg: 'bg-red-100 dark:bg-red-900/30', 
    text: 'Failed' 
  },
  none: { 
    icon: Shield, 
    color: 'text-gray-600 dark:text-gray-400', 
    bg: 'bg-gray-100 dark:bg-gray-900/30', 
    text: 'Not Verified' 
  }
};