// hooks/useTaskPoller.tsx
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { Task } from '@/lib/types';

interface UseTaskPollerProps {
  enabled: boolean;
  latestCreatedAt: string | null;
  onNewTasks: (tasks: Task[]) => void;
}

interface NewTasksResponse {
  tasks: Task[];
  count: number;
}

const fetcher = async (url: string): Promise<NewTasksResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch new tasks');
  }
  return response.json();
};

export const useTaskPoller = ({ enabled, latestCreatedAt, onNewTasks }: UseTaskPollerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const toastIdRef = useRef<string | null>(null);

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Build the API URL
  const apiUrl = enabled && isVisible && latestCreatedAt 
    ? `/api/tasks?after=${encodeURIComponent(latestCreatedAt)}` 
    : null;

  // SWR polling configuration
  const { error } = useSWR<NewTasksResponse>(
    apiUrl,
    fetcher,
    {
      refreshInterval: enabled && isVisible ? 15000 : 0, // Poll every 15 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Prevent duplicate requests within 10s
      onSuccess: (data) => {
        if (data?.tasks?.length > 0) {
          setPendingTasks(data.tasks);
          showNewTasksToast(data.count, data.tasks);
        }
      },
      onError: (error) => {
        console.error('Task polling error:', error);
      }
    }
  );

  const showNewTasksToast = (count: number, tasks: Task[]) => {
    // Dismiss any existing toast
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    toastIdRef.current = toast(
      (t) => (
        <div
          onClick={() => {
            handleLoadNewTasks(tasks);
            toast.dismiss(t.id);
          }}
          className="flex items-center gap-3 cursor-pointer bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[280px]"
        >
          <div className="text-2xl">🔔</div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {count} new task{count > 1 ? 's' : ''} within 5 km
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tap to load
            </div>
          </div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      ),
      {
        duration: 10000,
        position: 'bottom-center',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }
    );
  };

  const handleLoadNewTasks = (tasks: Task[]) => {
    onNewTasks(tasks);
    setPendingTasks([]);
    toastIdRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  return {
    isPolling: enabled && isVisible && !!apiUrl,
    error,
    pendingTasksCount: pendingTasks.length,
    loadPendingTasks: () => {
      if (pendingTasks.length > 0) {
        handleLoadNewTasks(pendingTasks);
      }
    }
  };
};