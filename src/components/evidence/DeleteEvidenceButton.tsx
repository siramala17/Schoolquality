"use client";

import { useTransition } from "react";
import { deleteEvidence } from "@/lib/actions/evidence";

export default function DeleteEvidenceButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="text-xs text-bad hover:underline disabled:opacity-50"
      disabled={pending}
      onClick={() => {
        if (!confirm("ลบหลักฐานนี้?")) return;
        startTransition(() => {
          deleteEvidence(id);
        });
      }}
    >
      ลบ
    </button>
  );
}
