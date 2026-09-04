import { prisma } from "@/lib/prisma";

export async function getTeachers() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", active: true },
    orderBy: { name: "asc" },
  });
  return teachers.map((t) => ({ id: t.id, email: t.email, name: t.name, subjectGroup: t.subjectGroup }));
}

export async function getSubjectGroups(): Promise<string[]> {
  const rows = await prisma.user.findMany({
    where: { subjectGroup: { not: null } },
    select: { subjectGroup: true },
    distinct: ["subjectGroup"],
  });
  return rows.map((r) => r.subjectGroup!).filter(Boolean).sort();
}
