"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import type { FeedbackStatus } from "@/generated/prisma/enums";

export async function updateTeacherResponse(feedbackId: string, response: string, status: FeedbackStatus) {
  const user = await requireUser();
  const fb = await prisma.feedback.findUnique({ where: { id: feedbackId }, include: { observation: true } });
  if (!fb) throw new Error("ไม่พบข้อมูล");
  if (user.role === "TEACHER" && fb.observation.teacherId !== user.id) {
    throw new Error("คุณไม่มีสิทธิ์ทำรายการนี้");
  }
  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { teacherResponse: response, status },
  });
  revalidatePath("/feedback");
  revalidatePath("/dashboard");
}
