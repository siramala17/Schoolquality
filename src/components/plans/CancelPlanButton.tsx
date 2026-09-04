"use client";

import { useTransition } from "react";
import { updatePlanStatus } from "@/lib/actions/plans";

export default function CancelPlanButton({ planId }: { planId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="text-xs text-bad hover:underline disabled:opacity-50"
      disabled={pending}
      onClick={() => {
        if (!confirm("ยกเลิกแผนการนิเทศนี้?")) return;
        startTransition(() => {
          updatePlanStatus(planId, "CANCELLED");
        });
      }}
    >
      ยกเลิก
    </button>
  );
}
