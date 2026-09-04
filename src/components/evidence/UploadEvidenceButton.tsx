"use client";

import { useRef, useState, useTransition } from "react";
import { uploadEvidence } from "@/lib/actions/evidence";
import { PrimaryButton, SecondaryButton, Label, inputClass } from "@/components/ui";

type ObsOption = { id: string; teacherName: string; date: string };

export default function UploadEvidenceButton({ obsOptions }: { obsOptions: ObsOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await uploadEvidence(fd);
        setOpen(false);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)} className="shrink-0">
        + อัปโหลดหลักฐาน
      </PrimaryButton>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="bg-surface rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">อัปโหลดหลักฐานการพัฒนา</h3>
            <form ref={formRef} onSubmit={onSubmit}>
              <Label text="ไฟล์ (รูปภาพ, PDF, Word, PowerPoint — สูงสุด 4MB)">
                <input type="file" name="file" required className={inputClass} />
              </Label>
              <Label text="คำอธิบาย">
                <textarea name="description" rows={2} className={inputClass} />
              </Label>
              <Label text="เกี่ยวข้องกับการนิเทศครั้งที่ (ถ้ามี)">
                <select name="relatedObsId" className={inputClass} defaultValue="">
                  <option value="">-- ไม่ระบุ --</option>
                  {obsOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.teacherName} - {o.date}
                    </option>
                  ))}
                </select>
              </Label>
              {error && <p className="text-sm text-bad mb-2">{error}</p>}
              <div className="flex justify-end gap-2 mt-2">
                <SecondaryButton type="button" onClick={() => setOpen(false)}>
                  ยกเลิก
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={pending}>
                  {pending ? "กำลังอัปโหลด..." : "อัปโหลด"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
