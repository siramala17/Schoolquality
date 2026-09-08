"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton, SecondaryButton, inputClass, StatusPill } from "@/components/ui";
import { COMMITTEE_ROLE_OPTIONS, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_CLASS } from "@/lib/labels";
import type { AssignmentStatus } from "@/generated/prisma/enums";
import { setCommittee } from "@/lib/actions/assignments";

type Member = { userId: string; name: string; roleLabel: string | null; submitted: boolean };
type Assignment = {
  id: string;
  teacherName: string;
  label: string;
  status: AssignmentStatus;
  members: Member[];
};
type Candidate = { id: string; name: string; role: string };

export default function CommitteeManager({
  assignments,
  candidates,
}: {
  assignments: Assignment[];
  candidates: Candidate[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState<Assignment | null>(null);
  const [picked, setPicked] = useState<Record<string, string | null>>({});
  const [error, setError] = useState<string | null>(null);

  function openEditor(a: Assignment) {
    setOpen(a);
    setError(null);
    setPicked(Object.fromEntries(a.members.map((m) => [m.userId, m.roleLabel ?? "กรรมการ"])));
  }

  function toggle(id: string) {
    setPicked((s) => {
      const next = { ...s };
      if (id in next) delete next[id];
      else next[id] = "กรรมการ";
      return next;
    });
  }

  function save() {
    if (!open) return;
    setError(null);
    const members = Object.entries(picked).map(([userId, roleLabel]) => ({ userId, roleLabel }));
    startTransition(async () => {
      try {
        await setCommittee(open.id, members);
        setOpen(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <div className="space-y-3">
      {assignments.length === 0 && (
        <p className="text-sm text-text-muted">ยังไม่มีการมอบหมาย — ไปที่เมนู “มอบหมายชุดประเมิน” ก่อน</p>
      )}
      {assignments.map((a) => (
        <div key={a.id} className="bg-surface rounded-xl shadow-sm border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{a.teacherName}</div>
              <div className="text-xs text-text-muted">{a.label}</div>
            </div>
            <StatusPill label={ASSIGNMENT_STATUS_LABELS[a.status]} className={ASSIGNMENT_STATUS_CLASS[a.status]} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {a.members.length === 0 && <span className="text-xs text-text-muted">ยังไม่ได้แต่งตั้งกรรมการ</span>}
            {a.members.map((m) => (
              <span
                key={m.userId}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  m.submitted ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-bg border-border text-text-muted"
                }`}
              >
                {m.name}
                {m.roleLabel ? ` · ${m.roleLabel}` : ""}
                {m.submitted ? " ✓" : ""}
              </span>
            ))}
          </div>
          <SecondaryButton className="mt-3 text-sm" onClick={() => openEditor(a)}>
            แต่งตั้ง / แก้ไขกรรมการ
          </SecondaryButton>
        </div>
      ))}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setOpen(null)}>
          <div
            className="w-full max-w-md bg-surface rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">แต่งตั้งกรรมการนิเทศ</h3>
            <p className="text-sm text-text-muted mb-4">
              {open.teacherName} — {open.label}
            </p>
            <div className="border border-border rounded-lg divide-y divide-border max-h-72 overflow-y-auto">
              {candidates.map((c) => {
                const on = c.id in picked;
                return (
                  <div key={c.id} className="flex items-center gap-2 px-3 py-2">
                    <input type="checkbox" checked={on} onChange={() => toggle(c.id)} />
                    <span className="text-sm flex-1">{c.name}</span>
                    {on && (
                      <select
                        className={`${inputClass} !w-40 !py-1 text-xs`}
                        value={picked[c.id] ?? "กรรมการ"}
                        onChange={(e) => setPicked((s) => ({ ...s, [c.id]: e.target.value }))}
                      >
                        {COMMITTEE_ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
            {error && <p className="text-sm text-bad mt-3">{error}</p>}
            <div className="flex gap-2 justify-end mt-4">
              <SecondaryButton onClick={() => setOpen(null)}>ยกเลิก</SecondaryButton>
              <PrimaryButton onClick={save} disabled={pending}>
                {pending ? "กำลังบันทึก..." : "บันทึก"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
