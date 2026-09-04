import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export type ReportFilters = {
  teacherEmail?: string;
  subjectGroup?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function generateReport(filters: ReportFilters = {}) {
  await requireRole(["ADMIN", "EXECUTIVE"]);

  const observations = await prisma.observation.findMany({
    where: {
      teacher: filters.teacherEmail ? { email: filters.teacherEmail } : undefined,
      subjectGroup: filters.subjectGroup || undefined,
      date: {
        gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
      },
    },
    include: { teacher: true, supervisor: true },
    orderBy: { date: "desc" },
  });

  const byTeacher: Record<
    string,
    { name: string; subjectGroup: string | null; count: number; totalScore: number; avgScore: number }
  > = {};

  observations.forEach((o) => {
    const key = o.teacherId;
    if (!byTeacher[key]) {
      byTeacher[key] = { name: o.teacher.name, subjectGroup: o.subjectGroup, count: 0, totalScore: 0, avgScore: 0 };
    }
    byTeacher[key].count++;
    byTeacher[key].totalScore += o.overallScore;
  });
  Object.values(byTeacher).forEach((t) => {
    t.avgScore = Math.round((t.totalScore / t.count) * 100) / 100;
  });

  return { totalObservations: observations.length, byTeacher, observations };
}
