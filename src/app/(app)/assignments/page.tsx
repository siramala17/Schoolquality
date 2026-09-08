import { requireRole } from "@/lib/auth-helpers";
import { listAssignments } from "@/lib/data/assignments";
import {
  getTeachers,
  getAssessmentForms,
  getAcademicYears,
  getSemesters,
  getRounds,
  getClassrooms,
  getSubjectGroups,
} from "@/lib/data/lookups";
import { SectionTitle } from "@/components/ui";
import AssignmentManager from "@/components/assignments/AssignmentManager";

export default async function AssignmentsPage() {
  await requireRole(["ADMIN"]);
  const [assignments, teachers, forms, years, semesters, rounds, classrooms, subjectGroups] = await Promise.all([
    listAssignments(),
    getTeachers(),
    getAssessmentForms(),
    getAcademicYears(),
    getSemesters(),
    getRounds(),
    getClassrooms(),
    getSubjectGroups(),
  ]);

  const rows = assignments.map((a) => ({
    id: a.id,
    teacherName: a.teacher.name,
    formId: a.formId,
    academicYearId: a.academicYearId,
    semesterId: a.semesterId,
    roundId: a.roundId,
    classroomId: a.classroomId,
    subjectGroupId: a.subjectGroupId,
    yearLabel: a.academicYear.year,
    semesterLabel: a.semester.name,
    roundLabel: a.round.name,
    classroomLabel: a.classroom?.name ?? "",
    status: a.status,
    committeeCount: a.committee.length,
  }));

  return (
    <div>
      <SectionTitle icon="🧩" count={rows.length}>
        มอบหมายชุดประเมิน
      </SectionTitle>
      <AssignmentManager
        rows={rows}
        lookups={{
          teachers: teachers.map((t) => ({ id: t.id, name: t.name })),
          forms: forms.map((f) => ({ id: f.id, name: f.name })),
          years: years.map((y) => ({ id: y.id, name: y.year })),
          semesters: semesters.map((s) => ({ id: s.id, name: s.name })),
          rounds: rounds.map((r) => ({ id: r.id, name: r.name })),
          classrooms: classrooms.map((c) => ({ id: c.id, name: c.name })),
          subjectGroups: subjectGroups.map((s) => ({ id: s.id, name: s.name })),
        }}
      />
    </div>
  );
}
