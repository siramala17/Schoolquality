import { prisma } from "@/lib/prisma";
import { LEVELS } from "@/lib/rubric";
import { FEEDBACK_STATUS_LABELS } from "@/lib/labels";
import { bangkokYearMonth } from "@/lib/date";

export async function getDashboardData() {
  const [teachers, observations, upcomingPlans, feedbacks] = await Promise.all([
    prisma.user.findMany({ where: { role: "TEACHER", active: true } }),
    prisma.observation.findMany({ include: { teacher: true } }),
    prisma.plan.findMany({
      where: { status: "SCHEDULED" },
      include: { teacher: true },
      orderBy: { date: "asc" },
    }),
    prisma.feedback.findMany(),
  ]);

  const totalTeachers = teachers.length;
  const observedTeacherIds = new Set(observations.map((o) => o.teacherId));
  const observedCount = teachers.filter((t) => observedTeacherIds.has(t.id)).length;
  const avgScore = observations.length
    ? observations.reduce((s, o) => s + o.overallScore, 0) / observations.length
    : 0;

  const monthly: Record<string, number> = {};
  observations.forEach((o) => {
    const key = bangkokYearMonth(o.date);
    monthly[key] = (monthly[key] ?? 0) + 1;
  });

  const levelDist: Record<string, number> = {};
  LEVELS.forEach((l) => (levelDist[l.label] = 0));
  observations.forEach((o) => {
    if (levelDist[o.level] !== undefined) levelDist[o.level]++;
  });

  const followUp: Record<string, number> = { รอติดตาม: 0, อยู่ระหว่างพัฒนา: 0, เสร็จสิ้น: 0 };
  feedbacks.forEach((f) => {
    const label = FEEDBACK_STATUS_LABELS[f.status];
    if (followUp[label] !== undefined) followUp[label]++;
  });

  const today = new Date(new Date().toDateString());
  const upcoming = upcomingPlans.filter((p) => new Date(p.date) >= today).slice(0, 5);

  return {
    kpi: {
      totalTeachers,
      totalObservations: observations.length,
      observedCount,
      notObservedCount: totalTeachers - observedCount,
      avgScore: Math.round(avgScore * 100) / 100,
    },
    monthly,
    levelDist,
    followUp,
    upcomingPlans: upcoming,
  };
}
