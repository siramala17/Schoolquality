"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const str = (v: unknown) => (v == null ? "" : String(v).trim());
const opt = (v: unknown) => str(v) || null;

async function guard() {
  await requireRole(["ADMIN"]);
}

/** Recompute an assignment's status from its committee's submissions. */
export async function recomputeStatus(assignmentId: string) {
  const committee = await prisma.committeeMember.findMany({
    where: { assignmentId },
    include: { evaluation: true },
  });
  const total = committee.length;
  const submitted = committee.filter((c) => c.evaluation?.submittedAt).length;
  const status = total === 0 || submitted === 0 ? "PENDING" : submitted >= total ? "COMPLETED" : "IN_PROGRESS";
  await prisma.assignment.update({ where: { id: assignmentId }, data: { status } });
}

export async function createAssignment(input: {
  teacherIds: string[];
  formId: string;
  academicYearId: string;
  semesterId: string;
  roundId: string;
  classroomId?: string | null;
  subjectGroupId?: string | null;
}) {
  await guard();
  const { teacherIds, formId, academicYearId, semesterId, roundId } = input;
  if (!teacherIds?.length || !formId || !academicYearId || !semesterId || !roundId) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }
  let created = 0;
  for (const teacherId of teacherIds) {
    try {
      await prisma.assignment.create({
        data: {
          teacherId,
          formId,
          academicYearId,
          semesterId,
          roundId,
          classroomId: opt(input.classroomId),
          subjectGroupId: opt(input.subjectGroupId),
        },
      });
      created++;
    } catch {
      /* duplicate teacher+round+semester+year — skip */
    }
  }
  revalidatePath("/assignments");
  if (created === 0) return { error: "ครูที่เลือกมีการมอบหมายในรอบนี้อยู่แล้ว" };
}

export async function updateAssignment(id: string, d: Record<string, unknown>) {
  await guard();
  await prisma.assignment.update({
    where: { id },
    data: {
      formId: str(d.formId) || undefined,
      academicYearId: str(d.academicYearId) || undefined,
      semesterId: str(d.semesterId) || undefined,
      roundId: str(d.roundId) || undefined,
      classroomId: opt(d.classroomId),
      subjectGroupId: opt(d.subjectGroupId),
    },
  });
  revalidatePath("/assignments");
}

export async function deleteAssignment(id: string) {
  await guard();
  try {
    await prisma.assignment.delete({ where: { id } });
  } catch {
    return { error: "ลบไม่ได้ มีผลการประเมินบันทึกไว้แล้ว" };
  }
  revalidatePath("/assignments");
}

export async function setCommittee(
  assignmentId: string,
  members: { userId: string; roleLabel: string | null }[],
) {
  await guard();
  const existing = await prisma.committeeMember.findMany({
    where: { assignmentId },
    include: { evaluation: true },
  });
  const keepUserIds = new Set(members.map((m) => m.userId));

  // Remove seats no longer selected (only when they have no submitted evaluation).
  for (const seat of existing) {
    if (!keepUserIds.has(seat.userId)) {
      if (seat.evaluation?.submittedAt) continue;
      await prisma.committeeMember.delete({ where: { id: seat.id } });
    }
  }

  // Upsert selected seats.
  let order = 0;
  for (const m of members) {
    order++;
    const prev = existing.find((e) => e.userId === m.userId);
    if (prev) {
      await prisma.committeeMember.update({
        where: { id: prev.id },
        data: { roleLabel: m.roleLabel, order },
      });
    } else {
      await prisma.committeeMember.create({
        data: { assignmentId, userId: m.userId, roleLabel: m.roleLabel, order },
      });
    }
  }

  await recomputeStatus(assignmentId);
  revalidatePath("/committee");
  revalidatePath("/assignments");
}
