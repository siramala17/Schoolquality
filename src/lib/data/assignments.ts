import { prisma } from "@/lib/prisma";

const fullInclude = {
  teacher: { include: { subjectGroup: true } },
  form: { include: { domains: { orderBy: { order: "asc" as const }, include: { items: { orderBy: { order: "asc" as const } } } } } },
  academicYear: true,
  semester: true,
  round: true,
  classroom: true,
  subjectGroup: true,
  committee: {
    orderBy: { order: "asc" as const },
    include: {
      user: true,
      evaluation: { include: { scores: true, evidence: true } },
    },
  },
};

export type FullAssignment = Awaited<ReturnType<typeof getAssignment>>;

export function getAssignment(id: string) {
  return prisma.assignment.findUnique({ where: { id }, include: fullInclude });
}

export function listAssignments() {
  return prisma.assignment.findMany({
    include: fullInclude,
    orderBy: [{ academicYear: { year: "desc" } }, { round: { order: "asc" } }, { teacher: { name: "asc" } }],
  });
}

export function assignmentsForTeacher(teacherId: string) {
  return prisma.assignment.findMany({
    where: { teacherId },
    include: fullInclude,
    orderBy: [{ academicYear: { year: "asc" } }, { round: { order: "asc" } }],
  });
}

export function getCommitteeSeat(id: string) {
  return prisma.committeeMember.findUnique({
    where: { id },
    include: {
      user: true,
      evaluation: { include: { scores: true, evidence: true } },
      assignment: { include: fullInclude },
    },
  });
}

export function mySeats(userId: string) {
  return prisma.committeeMember.findMany({
    where: { userId },
    include: {
      evaluation: { include: { scores: true } },
      assignment: { include: fullInclude },
    },
    orderBy: { assignment: { createdAt: "desc" } },
  });
}
