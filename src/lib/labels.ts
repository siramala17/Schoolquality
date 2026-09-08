import type { Role, AssignmentStatus } from "@/generated/prisma/enums";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  EXECUTIVE: "ผู้บริหาร",
  TEACHER: "ครู",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  PENDING: "รอการประเมิน",
  IN_PROGRESS: "กำลังประเมิน",
  COMPLETED: "ประเมินเสร็จแล้ว",
};

export const ASSIGNMENT_STATUS_CLASS: Record<AssignmentStatus, string> = {
  PENDING: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
};

export const COMMITTEE_ROLE_OPTIONS = ["ประธานกรรมการ", "กรรมการ", "กรรมการและเลขานุการ"];
