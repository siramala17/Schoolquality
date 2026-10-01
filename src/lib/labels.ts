import type { Role, AssignmentStatus } from "@/generated/prisma/enums";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  EXECUTIVE: "ผู้บริหาร",
  SUPERVISOR: "ผู้ดูแล",
  COMMITTEE: "กรรมการนิเทศ",
  TEACHER: "ครู",
};

// บทบาทที่ดูผลการนิเทศ/รายงานของครูทุกคนได้ (ผู้ดูแลดูได้อย่างเดียว ไม่มีเมนูจัดการระบบ)
export const REPORT_ROLES: Role[] = ["ADMIN", "EXECUTIVE", "SUPERVISOR"];

// กลุ่มการลงทะเบียนผู้ใช้งาน — แต่ละกลุ่มลงทะเบียนแยกกันในหน้าจัดการผู้ใช้งาน
export type UserGroup = "admin" | "supervisor" | "committee" | "supervisee";

export const USER_GROUPS: Record<UserGroup, { label: string; icon: string; roles: Role[] }> = {
  admin: { label: "ผู้ดูแล", icon: "🛡️", roles: ["ADMIN", "SUPERVISOR"] },
  supervisor: { label: "ผู้นิเทศ", icon: "🧑‍💼", roles: ["EXECUTIVE"] },
  committee: { label: "กรรมการนิเทศ", icon: "🧑‍⚖️", roles: ["COMMITTEE"] },
  supervisee: { label: "ผู้รับการนิเทศ", icon: "🧑‍🏫", roles: ["TEACHER"] },
};

export function isUserGroup(v: unknown): v is UserGroup {
  return typeof v === "string" && v in USER_GROUPS;
}

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

export const COMMITTEE_ROLE_OPTIONS = [
  "ประธานกรรมการ",
  "กรรมการ",
  "กรรมการและเลขานุการ",
  "ผู้สังเกตชั้นเรียน",
  "ศึกษานิเทศก์",
];
