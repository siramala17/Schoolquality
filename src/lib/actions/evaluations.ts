"use server";

import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth-helpers";
import { recomputeStatus } from "@/lib/actions/assignments";
import { revalidatePath } from "next/cache";

export async function saveEvaluation(
  committeeMemberId: string,
  input: {
    scores: Record<string, number>;
    strengths?: string | null;
    improvements?: string | null;
    suggestions?: string | null;
    signatureData?: string | null;
    submit: boolean;
  },
) {
  const user = await requireUser();
  const seat = await prisma.committeeMember.findUnique({
    where: { id: committeeMemberId },
    include: { evaluation: true },
  });
  if (!seat) return { error: "ไม่พบรายการประเมิน" };
  if (seat.userId !== user.id && user.role !== "ADMIN") return { error: "คุณไม่มีสิทธิ์ประเมินรายการนี้" };

  const scoreEntries = Object.entries(input.scores).filter(([, v]) => typeof v === "number" && v >= 1 && v <= 5);

  if (input.submit && scoreEntries.length === 0) {
    return { error: "กรุณาให้คะแนนอย่างน้อย 1 รายการ" };
  }

  const evaluation = await prisma.evaluation.upsert({
    where: { committeeMemberId },
    create: {
      committeeMemberId,
      strengths: input.strengths || null,
      improvements: input.improvements || null,
      suggestions: input.suggestions || null,
      signatureData: input.signatureData || null,
      submittedAt: input.submit ? new Date() : null,
    },
    update: {
      strengths: input.strengths || null,
      improvements: input.improvements || null,
      suggestions: input.suggestions || null,
      signatureData: input.signatureData || seat.evaluation?.signatureData || null,
      submittedAt: input.submit ? new Date() : seat.evaluation?.submittedAt ?? null,
    },
  });

  await prisma.itemScore.deleteMany({ where: { evaluationId: evaluation.id } });
  if (scoreEntries.length) {
    await prisma.itemScore.createMany({
      data: scoreEntries.map(([itemId, score]) => ({ evaluationId: evaluation.id, itemId, score })),
    });
  }

  await recomputeStatus(seat.assignmentId);
  revalidatePath("/evaluate");
  revalidatePath("/summary");
  revalidatePath("/results");
  return { ok: true };
}

export async function addEvidence(committeeMemberId: string, formData: FormData) {
  const user = await requireUser();
  const seat = await prisma.committeeMember.findUnique({
    where: { id: committeeMemberId },
    include: { evaluation: true },
  });
  if (!seat) return { error: "ไม่พบรายการ" };
  if (seat.userId !== user.id && user.role !== "ADMIN") return { error: "ไม่มีสิทธิ์" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "กรุณาเลือกไฟล์" };
  if (file.size > 4 * 1024 * 1024) return { error: "ไฟล์ต้องไม่เกิน 4MB" };

  let evaluationId = seat.evaluation?.id;
  if (!evaluationId) {
    const ev = await prisma.evaluation.create({ data: { committeeMemberId } });
    evaluationId = ev.id;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  await prisma.evidence.create({
    data: { evaluationId, fileName: file.name, fileType: file.type || "application/octet-stream", fileData: bytes },
  });
  revalidatePath("/evaluate");
  revalidatePath("/summary");
  return { ok: true };
}

export async function deleteEvidence(id: string) {
  const user = await requireUser();
  const ev = await prisma.evidence.findUnique({
    where: { id },
    include: { evaluation: { include: { committeeMember: true } } },
  });
  if (!ev) return { error: "ไม่พบไฟล์" };
  if (ev.evaluation.committeeMember.userId !== user.id && user.role !== "ADMIN") return { error: "ไม่มีสิทธิ์" };
  await prisma.evidence.delete({ where: { id } });
  revalidatePath("/evaluate");
  revalidatePath("/summary");
  return { ok: true };
}

export async function acknowledgeAssignment(assignmentId: string, signatureData: string) {
  const user = await requireUser();
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) return { error: "ไม่พบรายการ" };
  if (assignment.teacherId !== user.id) throw new AuthError("เฉพาะครูผู้รับการนิเทศเท่านั้น");
  if (assignment.status !== "COMPLETED") return { error: "ยังประเมินไม่ครบทุกคน" };

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { acknowledgedAt: new Date(), teacherSignatureData: signatureData || null },
  });
  revalidatePath("/my-supervision");
  revalidatePath("/summary");
  return { ok: true };
}
