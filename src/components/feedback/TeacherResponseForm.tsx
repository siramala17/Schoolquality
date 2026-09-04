"use client";

import { useState, useTransition } from "react";
import { updateTeacherResponse } from "@/lib/actions/feedback";
import { PrimaryButton, Label, inputClass } from "@/components/ui";
import { FEEDBACK_STATUS_LABELS } from "@/lib/labels";
import type { FeedbackStatus } from "@/generated/prisma/enums";

const STATUS_OPTIONS: FeedbackStatus[] = ["PENDING", "IN_PROGRESS", "DONE"];

export default function TeacherResponseForm({
  feedbackId,
  initialResponse,
  initialStatus,
}: {
  feedbackId: string;
  initialResponse: string;
  initialStatus: FeedbackStatus;
}) {
  const [response, setResponse] = useState(initialResponse);
  const [status, setStatus] = useState<FeedbackStatus>(initialStatus);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateTeacherResponse(feedbackId, response, status);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <Label text="บันทึกความก้าวหน้า / สิ่งที่ได้พัฒนา">
        <textarea className={inputClass} rows={3} value={response} onChange={(e) => setResponse(e.target.value)} />
      </Label>
      <Label text="สถานะ">
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as FeedbackStatus)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {FEEDBACK_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Label>
      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "กำลังบันทึก..." : "บันทึก"}
        </PrimaryButton>
        {saved && <span className="text-sm text-good">บันทึกแล้ว</span>}
      </div>
    </form>
  );
}
