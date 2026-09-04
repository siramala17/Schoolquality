import type { Role, PlanStatus, FeedbackStatus } from "@/generated/prisma/enums";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  EXECUTIVE: "ผู้บริหาร",
  TEACHER: "ครู",
};

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  SCHEDULED: "กำหนดการ",
  DONE: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  PENDING: "รอติดตาม",
  IN_PROGRESS: "อยู่ระหว่างพัฒนา",
  DONE: "เสร็จสิ้น",
};

export const PLAN_STATUS_CLASS: Record<PlanStatus, string> = {
  SCHEDULED: "bg-amber-50 text-amber-700",
  DONE: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

export const FEEDBACK_STATUS_CLASS: Record<FeedbackStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  IN_PROGRESS: "bg-sky-50 text-sky-700",
  DONE: "bg-emerald-50 text-emerald-700",
};
