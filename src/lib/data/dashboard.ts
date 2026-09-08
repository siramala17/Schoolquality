import { prisma } from "@/lib/prisma";
import { buildSummary } from "@/lib/summary";
import { round2, levelFor, type QualityLevelLike } from "@/lib/scoring";
import { getQualityLevelsForScoring } from "@/lib/data/lookups";

const fullInclude = {
  teacher: true,
  form: { include: { domains: { orderBy: { order: "asc" as const }, include: { items: { orderBy: { order: "asc" as const } } } } } },
  academicYear: true,
  semester: true,
  round: true,
  classroom: true,
  subjectGroup: true,
  committee: { include: { user: true, evaluation: { include: { scores: true } } } },
};

export type DashFilters = { roundId?: string; semesterId?: string; yearId?: string };

export async function getDashboardData(filters: DashFilters) {
  const where: Record<string, string> = {};
  if (filters.roundId) where.roundId = filters.roundId;
  if (filters.semesterId) where.semesterId = filters.semesterId;
  if (filters.yearId) where.academicYearId = filters.yearId;

  const [executives, teachers, assignments, levels] = await Promise.all([
    prisma.user.count({ where: { role: "EXECUTIVE", active: true } }),
    prisma.user.count({ where: { role: "TEACHER", active: true } }),
    prisma.assignment.findMany({ where, include: fullInclude }),
    getQualityLevelsForScoring(),
  ]);

  const lv = levels as QualityLevelLike[];

  let assigned = 0;
  let inProgress = 0;
  let completed = 0;

  const perTeacherScores = new Map<string, { name: string; scores: number[] }>();
  const perDomainScores = new Map<string, number[]>();

  for (const a of assignments) {
    if (a.committee.length > 0) assigned++;
    if (a.status === "IN_PROGRESS") inProgress++;
    if (a.status === "COMPLETED") completed++;

    const s = buildSummary(a, lv);
    if (s.overall.avg != null) {
      const t = perTeacherScores.get(a.teacherId) ?? { name: a.teacher.name, scores: [] };
      t.scores.push(s.overall.avg);
      perTeacherScores.set(a.teacherId, t);

      for (const d of a.form.domains) {
        const da = s.perDomain[d.id]?.avg;
        if (da != null) {
          const key = d.name;
          const arr = perDomainScores.get(key) ?? [];
          arr.push(da);
          perDomainScores.set(key, arr);
        }
      }
    }
  }

  const perTeacher = [...perTeacherScores.values()].map((t) => {
    const avg = t.scores.reduce((x, y) => x + y, 0) / t.scores.length;
    return { name: t.name, avg: round2(avg), level: levelFor(avg, lv) };
  });

  const perDomain = [...perDomainScores.entries()].map(([name, arr]) => {
    const avg = arr.reduce((x, y) => x + y, 0) / arr.length;
    return { name, avg: round2(avg) };
  });

  const levelDist: Record<string, number> = {};
  for (const t of perTeacher) {
    const label = t.level?.label ?? "ไม่ระบุ";
    levelDist[label] = (levelDist[label] ?? 0) + 1;
  }

  return {
    kpi: { executives, teachers, assigned, inProgress, completed },
    perTeacher,
    perDomain,
    levelDist,
    qualityLevels: lv,
  };
}

export async function getTeacherRoundBreakdown(teacherId: string, levels: QualityLevelLike[]) {
  const rounds = await prisma.round.findMany({ orderBy: { order: "asc" } });
  const assignments = await prisma.assignment.findMany({
    where: { teacherId },
    include: fullInclude,
  });

  return assignments
    .sort((x, y) => x.academicYear.year.localeCompare(y.academicYear.year) || x.round.name.localeCompare(y.round.name))
    .map((a) => {
      const s = buildSummary(a, levels);
      return {
        id: a.id,
        label: `${a.round.name} ${a.semester.name} ปีการศึกษา ${a.academicYear.year}`,
        avg: s.overall.avg == null ? null : round2(s.overall.avg),
        level: s.overall.level,
        submitted: s.progress.submitted,
        total: s.progress.total,
        domains: a.form.domains.map((d) => ({
          name: d.name,
          avg: s.perDomain[d.id]?.avg == null ? null : round2(s.perDomain[d.id]!.avg!),
        })),
      };
    })
    .concat(
      // keep rounds without assignments visible as "awaiting"
      rounds
        .filter((r) => !assignments.some((a) => a.roundId === r.id))
        .map((r) => ({
          id: `pending-${r.id}`,
          label: r.name,
          avg: null as number | null,
          level: null as QualityLevelLike | null,
          submitted: 0,
          total: 0,
          domains: [] as { name: string; avg: number | null }[],
        })),
    );
}
