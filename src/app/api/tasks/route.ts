// File: src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/lib/types';

// Explicit export to ensure this is treated as a module
export {};

// Mock data for demonstration
// We must now supply a 'dbsRequirement' field for each Task.
const mockNewTasks: Task[] = [
  {
    id: 'new-1',
    title: 'Last-Minute Airport Pickup',
    description: 'Flight delayed, need urgent pickup from Gatwick to Central London.',
    location: 'Gatwick Airport • 4.2 km',
    category: 'transport',
    urgency: 'emergency',
    status: 'open',
    createdAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    estimatedDuration: '90 min',
    requesterId: 'user-new-1',
    perks: [
      {
        id: 'pn1',
        type: 'cash',
        value: 60,
        description: '£60 cash + fuel',
        tier: 1,
        successRate: 97,
        availability: 'instant',
      },
    ],
    tier: 1,
    successRate: 97,
    dbsRequirement: 'none', // added so Task shape is satisfied
  },
  {
    id: 'new-2',
    title: 'Urgent Medicine Delivery',
    description: 'Elderly patient needs prescription delivered urgently to care home.',
    location: 'Hammersmith, London • 3.8 km',
    category: 'delivery',
    urgency: 'emergency',
    status: 'open',
    createdAt: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    estimatedDuration: '30 min',
    requesterId: 'user-new-2',
    perks: [
      {
        id: 'pn2',
        type: 'cash',
        value: 45,
        description: '£45 PayPal',
        tier: 1,
        successRate: 99,
        availability: 'instant',
      },
    ],
    tier: 1,
    successRate: 99,
    dbsRequirement: 'none', // added so Task shape is satisfied
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const afterParam = searchParams.get('after');

    // Simulate checking for new tasks
    if (!afterParam) {
      return NextResponse.json(
        { error: 'Missing "after" parameter' },
        { status: 400 }
      );
    }

    const afterDate = new Date(afterParam);

    // In a real app, this would query your database for tasks created after the given timestamp
    // For demo purposes, we'll randomly return new tasks
    const shouldReturnNewTasks = Math.random() > 0.7; // 30% chance of new tasks

    if (shouldReturnNewTasks) {
      const newTasks = mockNewTasks.filter((task) =>
        new Date(task.createdAt) > afterDate
      );

      return NextResponse.json({
        tasks: newTasks,
        hasMore: false,
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      tasks: [],
      hasMore: false,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching new tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
