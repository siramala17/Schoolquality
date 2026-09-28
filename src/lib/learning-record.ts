// "แบบบันทึกการนิเทศการจัดการเรียนรู้" — one record per assignment, laid out like
// the school's paper form: scores of each observer per item, averages, total,
// percent and the observers' notes. Pure function over loaded assignments.
import { buildSummary } from "@/lib/summary";
import type { QualityLevelLike } from "@/lib/scoring";
import type { listAssignments } from "@/lib/data/assignments";

type LoadedAssignment = Awaited<ReturnType<typeof listAssignments>>[number];

export type LearningRecord = {
  id: string;
  teacher: string;
  subjectGroup: string | null;
  classroom: string | null;
  year: string;
  round: string;
  semester: string;
  observedAt: Date | null;
  observers: { name: string; position: string | null }[];
  domains: {
    name: string;
    avg: number | null;
    items: { name: string; scores: (number | null)[]; avg: number | null }[];
  }[];
  totals: number[]; // รวมคะแนน of each observer
  avg: number | null;
  percent: number | null;
  level: QualityLevelLike | null;
  // Aligned with `observers`.
  notes: { strengths: string | null; improvements: string | null; suggestions: string | null }[];
};

export function buildLearningRecords(assignments: LoadedAssignment[], levels: QualityLevelLike[]): LearningRecord[] {
  const maxScore = Math.max(...levels.map((l) => l.maxScore), 1);
  const records: LearningRecord[] = [];

  for (const a of assignments) {
    const seats = a.committee.filter((c) => c.evaluation?.submittedAt);
    if (seats.length === 0) continue; // ยังไม่มีผู้สังเกตส่งผล
    const s = buildSummary(a, levels);

    const submitted = seats.map((c) => c.evaluation!.submittedAt!.getTime());
    const domains = a.form.domains.map((d) => ({
      name: d.name,
      avg: s.perDomain[d.id]?.avg ?? null,
      items: d.items.map((it) => ({
        name: it.name,
        scores: seats.map((c) => s.perItem[it.id]?.byEvaluator[c.userId] ?? null),
        avg: s.perItem[it.id]?.avg ?? null,
      })),
    }));
    records.push({
      id: a.id,
      teacher: a.teacher.name,
      subjectGroup: (a.subjectGroup ?? a.teacher.subjectGroup)?.name ?? null,
      classroom: a.classroom?.name ?? null,
      year: a.academicYear.year,
      round: a.round.name,
      semester: a.semester.name,
      observedAt: new Date(Math.min(...submitted)),
      observers: seats.map((c) => ({ name: c.user.name, position: c.user.position ?? c.roleLabel })),
      domains,
      totals: seats.map((_, i) =>
        domains.reduce((sum, d) => sum + d.items.reduce((t, it) => t + (it.scores[i] ?? 0), 0), 0),
      ),
      avg: s.overall.avg,
      percent: s.overall.avg == null ? null : (s.overall.avg / maxScore) * 100,
      level: s.overall.level,
      notes: seats.map((c) => ({
        strengths: c.evaluation!.strengths,
        improvements: c.evaluation!.improvements,
        suggestions: c.evaluation!.suggestions,
      })),
    });
  }

  return records.sort((x, y) => x.teacher.localeCompare(y.teacher, "th"));
}
