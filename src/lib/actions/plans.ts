"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import type { PlanStatus } from "@/generated/prisma/enums";

export async function createPlan(input: {
  semester: string;
  academicYear: string;
  date: string;
  time?: string;
  teacherId: string;
  subjectGroup?: string;
  topic?: string;
}) {
  const user = await requireRole(["ADMIN", "EXECUTIVE"]);
  await prisma.plan.create({
    data: {
      semester: input.semester,
      academicYear: input.academicYear,
      date: new Date(input.date),
      time: input.time || null,
      subjectGroup: input.subjectGroup || null,
      topic: input.topic || null,
      status: "SCHEDULED",
      supervisorId: user.id,
      teacherId: input.teacherId,
    },
  });
  revalidatePath("/plans");
  revalidatePath("/dashboard");
  revalidatePath("/observation");
}

export async function updatePlanStatus(planId: string, status: PlanStatus) {
  await requireRole(["ADMIN", "EXECUTIVE"]);
  await prisma.plan.update({ where: { id: planId }, data: { status } });
  revalidatePath("/plans");
  revalidatePath("/dashboard");
}
