import { prisma } from "@/lib/prisma";
import { DEFAULT_QUALITY_LEVELS } from "@/lib/scoring";

export function getAcademicYears() {
  return prisma.academicYear.findMany({ orderBy: { year: "desc" } });
}
export function getSemesters() {
  return prisma.semester.findMany({ orderBy: { order: "asc" } });
}
export function getRounds() {
  return prisma.round.findMany({ orderBy: { order: "asc" } });
}
export function getClassrooms() {
  return prisma.classroom.findMany({ orderBy: { order: "asc" } });
}
export function getSubjectGroups() {
  return prisma.subjectGroup.findMany({ orderBy: { order: "asc" } });
}
export function getAssessmentForms() {
  return prisma.assessmentForm.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { domains: true, assignments: true } } },
  });
}

export async function getQualityLevels() {
  const rows = await prisma.qualityLevel.findMany({ orderBy: { order: "asc" } });
  return rows;
}

/** Quality levels for scoring, falling back to defaults when the table is empty. */
export async function getQualityLevelsForScoring() {
  const rows = await prisma.qualityLevel.findMany({ orderBy: { order: "asc" } });
  return rows.length ? rows : DEFAULT_QUALITY_LEVELS;
}

export async function getSchool() {
  return (
    (await prisma.school.findUnique({ where: { id: "default" } })) ?? {
      id: "default",
      name: "โรงเรียนเทศบาลวัดกลาง",
      department: "สำนักการศึกษาเทศบาลนครขอนแก่น",
      address: null as string | null,
      logoData: null,
      logoType: null,
      updatedAt: new Date(),
    }
  );
}

export function getUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: { subjectGroup: true },
  });
}

export function getTeachers() {
  return prisma.user.findMany({
    where: { role: "TEACHER", active: true },
    orderBy: { name: "asc" },
    include: { subjectGroup: true },
  });
}

/** Anyone who can sit on a committee (all active users). */
export function getPossibleCommitteeMembers() {
  return prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}
