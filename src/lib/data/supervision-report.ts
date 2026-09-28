import { listAssignments } from "@/lib/data/assignments";
import { getAcademicYears, getQualityLevelsForScoring, getRounds, getSchool, getSemesters } from "@/lib/data/lookups";
import { buildSupervisionReport, type SupervisionReport } from "@/lib/supervision-report";

export type ReportPart = { formId: string; formName: string; report: SupervisionReport };

export type ReportFilters = { roundId?: string; semesterId?: string; yearId?: string };

export function filtersFromSearchParams(sp: Record<string, string | string[] | undefined>): ReportFilters {
  const one = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);
  return { roundId: one(sp.round), semesterId: one(sp.semester), yearId: one(sp.year) };
}

export async function getSupervisionReport(filters: ReportFilters) {
  const [assignments, levels, school, rounds, semesters, years] = await Promise.all([
    listAssignments(filters),
    getQualityLevelsForScoring(),
    getSchool(),
    getRounds(),
    getSemesters(),
    getAcademicYears(),
  ]);

  const period = [
    rounds.find((r) => r.id === filters.roundId)?.name,
    semesters.find((s) => s.id === filters.semesterId)?.name,
    filters.yearId && `ปีการศึกษา ${years.find((y) => y.id === filters.yearId)?.year ?? ""}`,
  ]
    .filter(Boolean)
    .join(" ");

  // One report per assessment form (ครูภาษาต่างประเทศ / ขั้นพื้นฐาน) — their items differ.
  const byForm = new Map<string, typeof assignments>();
  for (const a of assignments) byForm.set(a.formId, [...(byForm.get(a.formId) ?? []), a]);
  const parts = [...byForm.values()]
    .map((list) => ({ formId: list[0].formId, formName: list[0].form.name, report: buildSupervisionReport(list, levels) }))
    .filter((p) => p.report.rows.length > 0)
    .sort((a, b) => a.formName.localeCompare(b.formName, "th"));

  return {
    parts,
    school,
    period,
    options: {
      rounds: rounds.map((r) => ({ id: r.id, name: r.name })),
      semesters: semesters.map((s) => ({ id: s.id, name: s.name })),
      years: years.map((y) => ({ id: y.id, name: y.year })),
    },
  };
}
