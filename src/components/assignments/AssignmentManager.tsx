"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PrimaryButton,
  SecondaryButton,
  GradientButton,
  inputClass,
  EmptyState,
  StatusPill,
} from "@/components/ui";
import { ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_CLASS } from "@/lib/labels";
import type { AssignmentStatus } from "@/generated/prisma/enums";
import { createAssignment, updateAssignment, deleteAssignment } from "@/lib/actions/assignments";

type Opt = { id: string; name: string };
type Row = {
  id: string;
  teacherName: string;
  formId: string;
  academicYearId: string;
  semesterId: string;
  roundId: string;
  classroomId: string | null;
  subjectGroupId: string | null;
  yearLabel: string;
  semesterLabel: string;
  roundLabel: string;
  classroomLabel: string;
  status: AssignmentStatus;
  committeeCount: number;
};

type Lookups = {
  teachers: Opt[];
  forms: Opt[];
  years: { id: string; name: string }[];
  semesters: Opt[];
  rounds: Opt[];
  classrooms: Opt[];
  subjectGroups: Opt[];
};

export default function AssignmentManager({ rows, lookups }: { rows: Row[]; lookups: Lookups }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"none" | "create" | "edit">("none");
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [teacherIds, setTeacherIds] = useState<string[]>([]);
  const [f, setF] = useState({
    formId: "",
    academicYearId: "",
    semesterId: "",
    roundId: "",
    classroomId: "",
    subjectGroupId: "",
  });

  function openCreate() {
    setMode("create");
    setEditing(null);
    setError(null);
    setTeacherIds([]);
    setF({
      formId: lookups.forms[0]?.id ?? "",
      academicYearId: lookups.years[0]?.id ?? "",
      semesterId: lookups.semesters[0]?.id ?? "",
      roundId: lookups.rounds[0]?.id ?? "",
      classroomId: "",
      subjectGroupId: "",
    });
  }

  function openEdit(row: Row) {
    setMode("edit");
    setEditing(row);
    setError(null);
    setF({
      formId: row.formId,
      academicYearId: row.academicYearId,
      semesterId: row.semesterId,
      roundId: row.roundId,
      classroomId: row.classroomId ?? "",
      subjectGroupId: row.subjectGroupId ?? "",
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      let res;
      if (mode === "create") {
        res = await createAssignment({ teacherIds, ...f });
      } else if (editing) {
        res = await updateAssignment(editing.id, f);
      }
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      setMode("none");
      router.refresh();
    });
  }

  function remove(row: Row) {
    if (!confirm("ยืนยันการลบการมอบหมายนี้?")) return;
    startTransition(async () => {
      const res = await deleteAssignment(row.id);
      if (res && "error" in res && res.error) alert(res.error);
      router.refresh();
    });
  }

  return (
    <div>
      <GradientButton className="w-full mb-4 py-3" onClick={openCreate}>
        ＋ มอบหมายชุดประเมิน
      </GradientButton>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/5 text-primary text-left">
                <th className="px-4 py-3 font-semibold">ครูผู้รับการนิเทศ</th>
                <th className="px-4 py-3 font-semibold">รอบ / ภาคเรียน / ปีการศึกษา</th>
                <th className="px-4 py-3 font-semibold">ชั้นเรียน</th>
                <th className="px-4 py-3 font-semibold text-center">กรรมการ</th>
                <th className="px-4 py-3 font-semibold">สถานะ</th>
                <th className="px-4 py-3 font-semibold text-center w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState>ยังไม่มีการมอบหมาย</EmptyState>
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.teacherName}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {r.roundLabel} / {r.semesterLabel} / {r.yearLabel}
                  </td>
                  <td className="px-4 py-3">{r.classroomLabel || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <Link href="/committee" className="text-primary hover:underline">
                      {r.committeeCount} คน
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={ASSIGNMENT_STATUS_LABELS[r.status]}
                      className={ASSIGNMENT_STATUS_CLASS[r.status]}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                        title="แก้ไข"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => remove(r)}
                        className="w-8 h-8 rounded-lg bg-bad/10 text-bad hover:bg-bad/20"
                        title="ลบ"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mode !== "none" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setMode("none")}
        >
          <div
            className="w-full max-w-lg bg-surface rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">
              {mode === "create" ? "มอบหมายชุดประเมิน" : `แก้ไขการมอบหมาย — ${editing?.teacherName}`}
            </h3>
            <form onSubmit={submit} className="space-y-3">
              {mode === "create" && (
                <div>
                  <span className="text-xs font-medium text-text-muted">ครูผู้รับการนิเทศ *</span>
                  <div className="mt-1 border border-border rounded-lg max-h-44 overflow-y-auto divide-y divide-border">
                    {lookups.teachers.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-bg">
                        <input
                          type="checkbox"
                          checked={teacherIds.includes(t.id)}
                          onChange={(e) =>
                            setTeacherIds((s) =>
                              e.target.checked ? [...s, t.id] : s.filter((x) => x !== t.id),
                            )
                          }
                        />
                        {t.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <Select label="แบบประเมิน *" value={f.formId} onChange={(v) => setF({ ...f, formId: v })} opts={lookups.forms} />
              <div className="grid grid-cols-2 gap-3">
                <Select label="รอบที่ *" value={f.roundId} onChange={(v) => setF({ ...f, roundId: v })} opts={lookups.rounds} />
                <Select
                  label="ภาคเรียน *"
                  value={f.semesterId}
                  onChange={(v) => setF({ ...f, semesterId: v })}
                  opts={lookups.semesters}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="ปีการศึกษา *"
                  value={f.academicYearId}
                  onChange={(v) => setF({ ...f, academicYearId: v })}
                  opts={lookups.years}
                />
                <Select
                  label="ชั้นเรียน"
                  value={f.classroomId}
                  onChange={(v) => setF({ ...f, classroomId: v })}
                  opts={lookups.classrooms}
                  allowEmpty
                />
              </div>
              <Select
                label="กลุ่มสาระการเรียนรู้"
                value={f.subjectGroupId}
                onChange={(v) => setF({ ...f, subjectGroupId: v })}
                opts={lookups.subjectGroups}
                allowEmpty
              />

              {error && <p className="text-sm text-bad">{error}</p>}
              <div className="flex gap-2 justify-end pt-1">
                <SecondaryButton type="button" onClick={() => setMode("none")}>
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
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  opts,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  opts: { id: string; name: string }[];
  allowEmpty?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {allowEmpty && <option value="">-- ไม่ระบุ --</option>}
        {!allowEmpty && <option value="">-- เลือก --</option>}
        {opts.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
