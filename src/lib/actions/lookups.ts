"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

type Data = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v).trim());
const num = (v: unknown) => (v == null || v === "" ? 0 : Number(v));

async function guard() {
  await requireRole(["ADMIN"]);
}

/* ---------------- Academic Year ---------------- */
export async function createAcademicYear(d: Data) {
  await guard();
  if (!str(d.year)) return { error: "กรุณากรอกปีการศึกษา" };
  try {
    await prisma.academicYear.create({ data: { year: str(d.year), active: Boolean(d.active) } });
  } catch {
    return { error: "ปีการศึกษานี้มีอยู่แล้ว" };
  }
  revalidatePath("/academic-years");
}
export async function updateAcademicYear(id: string, d: Data) {
  await guard();
  await prisma.academicYear.update({ where: { id }, data: { year: str(d.year), active: Boolean(d.active) } });
  revalidatePath("/academic-years");
}
export async function deleteAcademicYear(id: string) {
  await guard();
  try {
    await prisma.academicYear.delete({ where: { id } });
  } catch {
    return { error: "ลบไม่ได้ เนื่องจากมีการใช้งานอยู่" };
  }
  revalidatePath("/academic-years");
}

/* ---------------- Semester ---------------- */
export async function createSemester(d: Data) {
  await guard();
  await prisma.semester.create({ data: { name: str(d.name), order: num(d.order) } });
  revalidatePath("/semesters");
}
export async function updateSemester(id: string, d: Data) {
  await guard();
  await prisma.semester.update({ where: { id }, data: { name: str(d.name), order: num(d.order) } });
  revalidatePath("/semesters");
}
export async function deleteSemester(id: string) {
  await guard();
  try {
    await prisma.semester.delete({ where: { id } });
  } catch {
    return { error: "ลบไม่ได้ เนื่องจากมีการใช้งานอยู่" };
  }
  revalidatePath("/semesters");
}

/* ---------------- Round ---------------- */
export async function createRound(d: Data) {
  await guard();
  await prisma.round.create({ data: { name: str(d.name), order: num(d.order) } });
  revalidatePath("/rounds");
}
export async function updateRound(id: string, d: Data) {
  await guard();
  await prisma.round.update({ where: { id }, data: { name: str(d.name), order: num(d.order) } });
  revalidatePath("/rounds");
}
export async function deleteRound(id: string) {
  await guard();
  try {
    await prisma.round.delete({ where: { id } });
  } catch {
    return { error: "ลบไม่ได้ เนื่องจากมีการใช้งานอยู่" };
  }
  revalidatePath("/rounds");
}

/* ---------------- Classroom ---------------- */
export async function createClassroom(d: Data) {
  await guard();
  await prisma.classroom.create({ data: { name: str(d.name), order: num(d.order) } });
  revalidatePath("/classrooms");
}
export async function updateClassroom(id: string, d: Data) {
  await guard();
  await prisma.classroom.update({ where: { id }, data: { name: str(d.name), order: num(d.order) } });
  revalidatePath("/classrooms");
}
export async function deleteClassroom(id: string) {
  await guard();
  try {
    await prisma.classroom.delete({ where: { id } });
  } catch {
    return { error: "ลบไม่ได้ เนื่องจากมีการใช้งานอยู่" };
  }
  revalidatePath("/classrooms");
}

/* ---------------- Subject Group ---------------- */
export async function createSubjectGroup(d: Data) {
  await guard();
  await prisma.subjectGroup.create({ data: { name: str(d.name), order: num(d.order) } });
  revalidatePath("/subject-groups");
}
export async function updateSubjectGroup(id: string, d: Data) {
  await guard();
  await prisma.subjectGroup.update({ where: { id }, data: { name: str(d.name), order: num(d.order) } });
  revalidatePath("/subject-groups");
}
export async function deleteSubjectGroup(id: string) {
  await guard();
  try {
    await prisma.subjectGroup.delete({ where: { id } });
  } catch {
    return { error: "ลบไม่ได้ เนื่องจากมีการใช้งานอยู่" };
  }
  revalidatePath("/subject-groups");
}

/* ---------------- Quality Level ---------------- */
export async function createQualityLevel(d: Data) {
  await guard();
  await prisma.qualityLevel.create({
    data: {
      minScore: num(d.minScore),
      maxScore: num(d.maxScore),
      label: str(d.label),
      color: str(d.color) || "#0d9488",
      order: num(d.order),
    },
  });
  revalidatePath("/quality-levels");
}
export async function updateQualityLevel(id: string, d: Data) {
  await guard();
  await prisma.qualityLevel.update({
    where: { id },
    data: {
      minScore: num(d.minScore),
      maxScore: num(d.maxScore),
      label: str(d.label),
      color: str(d.color) || "#0d9488",
      order: num(d.order),
    },
  });
  revalidatePath("/quality-levels");
}
export async function deleteQualityLevel(id: string) {
  await guard();
  await prisma.qualityLevel.delete({ where: { id } });
  revalidatePath("/quality-levels");
}
