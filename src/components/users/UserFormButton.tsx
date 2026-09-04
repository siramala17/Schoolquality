"use client";

import { useState, useTransition } from "react";
import { upsertUser } from "@/lib/actions/users";
import { PrimaryButton, SecondaryButton, Label, inputClass } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/labels";
import type { Role } from "@/generated/prisma/enums";

const ROLES: Role[] = ["ADMIN", "EXECUTIVE", "TEACHER"];

type UserData = {
  email: string;
  name: string;
  role: Role;
  subjectGroup: string | null;
  position: string | null;
  active: boolean;
};

export default function UserFormButton({ initial }: { initial?: UserData }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await upsertUser({
          email: String(fd.get("email")),
          name: String(fd.get("name")),
          role: fd.get("role") as Role,
          subjectGroup: String(fd.get("subjectGroup") || ""),
          position: String(fd.get("position") || ""),
          active: fd.get("active") === "on",
        });
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <>
      {initial ? (
        <button onClick={() => setOpen(true)} className="text-xs text-primary hover:underline">
          แก้ไข
        </button>
      ) : (
        <PrimaryButton onClick={() => setOpen(true)}>+ เพิ่มผู้ใช้</PrimaryButton>
      )}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="bg-surface rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">{initial ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}</h3>
            <form onSubmit={onSubmit}>
              <Label text="อีเมล">
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={initial?.email}
                  disabled={!!initial}
                  className={`${inputClass} disabled:bg-bg disabled:text-text-muted`}
                />
              </Label>
              <Label text="ชื่อ">
                <input name="name" type="text" required defaultValue={initial?.name} className={inputClass} />
              </Label>
              <Label text="บทบาท">
                <select name="role" defaultValue={initial?.role || "TEACHER"} className={inputClass}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </Label>
              <Label text="กลุ่มสาระ">
                <input name="subjectGroup" type="text" defaultValue={initial?.subjectGroup || ""} className={inputClass} />
              </Label>
              <Label text="ตำแหน่ง">
                <input name="position" type="text" defaultValue={initial?.position || ""} className={inputClass} />
              </Label>
              <label className="flex items-center gap-2 text-sm mb-3">
                <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} /> ใช้งาน
              </label>
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
