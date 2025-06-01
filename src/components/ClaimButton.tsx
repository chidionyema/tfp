"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTaskClaims } from "@/hooks/useTaskClaims";
import { uiMessage } from "@/utils/uiMessage";

interface TaskLite {
  id: string;
  version: number;
  maxClaims: number;
  baseFee?: number;
}

export const ClaimButton = ({ task }: { task: TaskLite }) => {
  const { countPending, bestOffer } = useTaskClaims(task.id) ?? {};
  const [fee, setFee] = useState(bestOffer ? bestOffer.fee - 1 : task.baseFee || 20);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setLoading(true);
    const res = await fetch(`/api/tasks/${task.id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        helperId: "me", // ← replace by session user id
        fee,
        notes: "",
        clientVersion: task.version,
      }),
    });
    if (res.ok) {
      toast.success("Claim sent!");
      router.refresh();
    } else {
      const { error } = await res.json();
      toast.error(uiMessage(error));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={submit}
        disabled={loading || (countPending ?? 0) >= task.maxClaims}
        className="btn-primary w-full"
      >
        {loading ? "Submitting…" : "Claim task"}
      </button>
      <div className="text-xs text-gray-500 flex justify-between">
        <span>
          {countPending ?? 0}/{task.maxClaims} claimed
        </span>
        {bestOffer && <span>Best £{bestOffer.fee}</span>}
      </div>
      <input
        type="number"
        min={0}
        className="w-full mt-1 border rounded px-2 py-1 text-sm"
        value={fee}
        onChange={(e) => setFee(Number(e.target.value))}
      />
    </div>
  );
};
