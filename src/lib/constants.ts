// File: src/lib/constants.ts
// App constants and configuration

export const URGENCY_LEVELS = {
  low: { label: 'Low', color: 'green' },
  medium: { label: 'Medium', color: 'yellow' },
  high: { label: 'High', color: 'orange' },
  emergency: { label: 'Emergency', color: 'red' }
} as const;

export const TASK_CATEGORIES = {
  delivery: 'Delivery',
  shopping: 'Shopping',
  transport: 'Transport',
  personal: 'Personal Care',
  business: 'Business',
  tech: 'Tech Support'
} as const;

export const PERK_TIERS = {
  1: { label: 'Tier 1', successRate: 95, color: 'green' },
  2: { label: 'Tier 2', successRate: 90, color: 'blue' },
  3: { label: 'Tier 3', successRate: 85, color: 'yellow' },
  4: { label: 'Tier 4', successRate: 75, color: 'orange' },
  5: { label: 'Tier 5', successRate: 65, color: 'red' }
} as const;

export const API_ROUTES = {
  TASKS: '/api/tasks',
  USERS: '/api/users',
  MESSAGES: '/api/messages',
  NEGOTIATIONS: '/api/negotiations'
} as const;
