"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const MAX_FILE_BYTES = 4 * 1024 * 1024; // stay under Vercel's serverless request body limit

export async function uploadEvidence(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("กรุณาเลือกไฟล์");
  if (file.size > MAX_FILE_BYTES) throw new Error("ไฟล์ใหญ่เกินไป (สูงสุด 4MB)");

  const buffer = Buffer.from(await file.arrayBuffer());
  const relatedObsId = String(formData.get("relatedObsId") || "") || null;
  const description = String(formData.get("description") || "") || null;

  await prisma.evidence.create({
    data: {
      uploaderId: user.id,
      observationId: relatedObsId,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      fileData: buffer,
      description,
    },
  });
  revalidatePath("/evidence");
  revalidatePath("/feedback");
}

export async function deleteEvidence(evidenceId: string) {
  const user = await requireUser();
  const ev = await prisma.evidence.findUnique({ where: { id: evidenceId } });
  if (!ev) return;
  if (user.role === "TEACHER" && ev.uploaderId !== user.id) {
    throw new Error("ไม่มีสิทธิ์ลบไฟล์นี้");
  }
  await prisma.evidence.delete({ where: { id: evidenceId } });
  revalidatePath("/evidence");
  revalidatePath("/feedback");
}
