import { listAssignments } from "@/lib/data/assignments";
import { getQualityLevelsForScoring, getSchool } from "@/lib/data/lookups";
import { buildLearningRecords } from "@/lib/learning-record";
import type { ReportFilters } from "@/lib/data/supervision-report";

export async function getLearningRecords(filters: ReportFilters & { teacherId?: string }) {
  const [assignments, levels, school] = await Promise.all([
    listAssignments(filters),
    getQualityLevelsForScoring(),
    getSchool(),
  ]);
  const teachers = [...new Map(assignments.map((a) => [a.teacherId, a.teacher.name])).entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "th"));
  const mine = filters.teacherId ? assignments.filter((a) => a.teacherId === filters.teacherId) : assignments;

  return { records: buildLearningRecords(mine, levels), levels, school, teachers };
}
