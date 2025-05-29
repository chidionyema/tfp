// File: src/hooks/useTasks.ts
"use client";

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - in real app, this would fetch from your API
    setTimeout(() => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Emergency Document Delivery',
          description: 'Need passport collected and delivered to embassy',
          location: 'Camden → Mayfair',
          category: 'delivery',
          urgency: 'emergency',
          status: 'open',
          createdAt: '2024-01-15T10:30:00Z',
          estimatedDuration: '90 minutes',
          requesterId: 'user1',
          perks: [{
            id: 'p1',
            type: 'cash',
            value: 35,
            description: '£35 PayPal',
            tier: 1,
            successRate: 98,
            availability: 'instant'
          }],
          tier: 1,
          successRate: 96
        }
      ];
      setTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  const createTask = async (taskData: Partial<Task>) => {
    // Simulate API call
    console.log('Creating task:', taskData);
    return { success: true, id: 'new-task-id' };
  };

  const claimTask = async (taskId: string) => {
    // Simulate API call
    console.log('Claiming task:', taskId);
    return { success: true };
  };

  return {
    tasks,
    loading,
    createTask,
    claimTask
  };
};
