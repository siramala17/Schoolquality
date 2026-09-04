"use client";

import { useState, useTransition } from "react";
import { createPlan } from "@/lib/actions/plans";
import { PrimaryButton, SecondaryButton, Label, inputClass } from "@/components/ui";

type Teacher = { id: string; name: string; email: string; subjectGroup: string | null };

export default function NewPlanButton({ teachers }: { teachers: Teacher[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const teacherId = String(fd.get("teacherId") || "");
    if (!teacherId) {
      setError("กรุณาเลือกครู");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createPlan({
          semester: String(fd.get("semester")),
          academicYear: String(fd.get("academicYear")),
          date: String(fd.get("date")),
          time: String(fd.get("time") || ""),
          teacherId,
          subjectGroup: String(fd.get("subjectGroup") || ""),
          topic: String(fd.get("topic") || ""),
        });
        setOpen(false);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>+ สร้างแผนการนิเทศ</PrimaryButton>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-4">สร้างแผนการนิเทศ</h3>
            <form onSubmit={onSubmit}>
              <div className="grid grid-cols-3 gap-3">
                <Label text="ภาคเรียน">
                  <select name="semester" defaultValue="1" className={inputClass}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </Label>
                <Label text="ปีการศึกษา">
                  <input
                    name="academicYear"
                    type="number"
                    defaultValue={new Date().getFullYear() + 543}
                    required
                    className={inputClass}
                  />
                </Label>
                <Label text="วันที่">
                  <input name="date" type="date" required className={inputClass} />
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Label text="เวลา">
                  <input name="time" type="time" className={inputClass} />
                </Label>
                <Label text="กลุ่มสาระ">
                  <input name="subjectGroup" type="text" className={inputClass} />
                </Label>
              </div>
              <Label text="ครูผู้รับการนิเทศ">
                <select name="teacherId" required defaultValue="" className={inputClass}>
                  <option value="" disabled>
                    เลือกครู
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Label>
              <Label text="หัวข้อ/รายละเอียด">
                <textarea name="topic" className={inputClass} rows={2} />
              </Label>
              {error && <p className="text-sm text-bad mb-2">{error}</p>}
              <div className="flex justify-end gap-2 mt-2">
                <SecondaryButton type="button" onClick={() => setOpen(false)}>
                  ยกเลิก
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={pending}>
                  {pending ? "กำลังบันทึก..." : "บันทึก"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
