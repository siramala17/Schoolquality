import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export async function getEvidenceList(keyword?: string) {
  const user = await requireUser();
  return prisma.evidence.findMany({
    where: {
      uploaderId: user.role === "TEACHER" ? user.id : undefined,
      ...(keyword
        ? {
            OR: [
              { fileName: { contains: keyword } },
              { description: { contains: keyword } },
            ],
          }
        : {}),
    },
    // Deliberately omit fileData (bytes) here — list views never need the payload.
    select: {
      id: true,
      fileName: true,
      fileType: true,
      description: true,
      uploadedAt: true,
      observationId: true,
      uploader: true,
    },
    orderBy: { uploadedAt: "desc" },
  });
}
