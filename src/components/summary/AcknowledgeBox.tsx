"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui";
import SignaturePad from "@/components/SignaturePad";
import { acknowledgeAssignment } from "@/lib/actions/evaluations";

export default function AcknowledgeBox({ assignmentId, canAck }: { assignmentId: string; canAck: boolean }) {
  const router = useRouter();
  const [sig, setSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canAck) {
    return (
      <div className="bg-amber-50 text-amber-800 text-sm rounded-xl p-4">
        กรรมการยังประเมินไม่ครบทุกคน จึงยังไม่สามารถรับทราบผลได้
      </div>
    );
  }

  function submit() {
    if (!sig) {
      setError("กรุณาลงลายมือชื่อก่อน");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await acknowledgeAssignment(assignmentId, sig!);
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold mb-2">รับทราบผลการประเมิน</h3>
      <SignaturePad value={sig} onChange={setSig} />
      {error && <p className="text-sm text-bad mt-2">{error}</p>}
      <PrimaryButton className="mt-3 w-full py-2.5" disabled={pending} onClick={submit}>
        {pending ? "กำลังบันทึก..." : "ยืนยันการรับทราบ"}
      </PrimaryButton>
    </div>
  );
}
