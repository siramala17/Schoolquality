import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { AuthError } from "@/lib/auth-helpers";

export type ObservationFilters = {
  teacherEmail?: string;
  subjectGroup?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getObservations(filters: ObservationFilters = {}) {
  const user = await requireUser();
  return prisma.observation.findMany({
    where: {
      teacherId: user.role === "TEACHER" ? user.id : undefined,
      teacher: filters.teacherEmail ? { email: filters.teacherEmail } : undefined,
      subjectGroup: filters.subjectGroup || undefined,
      date: {
        gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
      },
    },
    include: { teacher: true, supervisor: true, feedback: true },
    orderBy: { date: "desc" },
  });
}

export async function getObservationDetail(id: string) {
  const user = await requireUser();
  const obs = await prisma.observation.findUnique({
    where: { id },
    include: {
      teacher: true,
      supervisor: true,
      feedback: true,
      evidence: {
        // Omit fileData (bytes) — detail view only links to /api/evidence/[id] for the file.
        select: {
          id: true,
          fileName: true,
          fileType: true,
          description: true,
          uploadedAt: true,
          uploader: true,
        },
      },
    },
  });
  if (!obs) throw new Error("ไม่พบข้อมูลการสังเกตการสอน");
  if (user.role === "TEACHER" && obs.teacherId !== user.id) {
    throw new AuthError("คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
  }
  return obs;
}
