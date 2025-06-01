// =============================================================================
// hooks/useTaskClaims.ts
// =============================================================================

import useSWR from "swr";
import Pusher from "pusher-js";
import { useEffect } from "react";

export interface ClaimSummary {
  countPending: number;
  bestOffer: { fee: number; helperRating: number } | null;
}

export const useTaskClaims = (taskId: string) => {
  const { data, mutate } = useSWR<ClaimSummary>(
    `/api/tasks/${taskId}/claims/summary`,
    (url: string) => fetch(url).then((r) => r.json())
  );

  useEffect(() => {
    if (!taskId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`task-${taskId}`);
    channel.bind("updated", () => {
      mutate();
    });

    return () => {
      pusher.unsubscribe(`task-${taskId}`);
      pusher.disconnect();
    };
  }, [taskId, mutate]);

  return data;
};
