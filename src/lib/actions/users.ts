"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/enums";

type Data = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v).trim());

function normalize(d: Data) {
  return {
    name: str(d.name),
    role: (str(d.role) || "TEACHER") as Role,
    position: str(d.position) || null,
    subjectGroupId: str(d.subjectGroupId) || null,
    active: d.active == null ? true : Boolean(d.active),
  };
}

export async function createUser(d: Data) {
  await requireRole(["ADMIN"]);
  const email = str(d.email).toLowerCase();
  if (!email) return { error: "กรุณากรอกอีเมล" };
  if (!str(d.name)) return { error: "กรุณากรอกชื่อ-นามสกุล" };
  try {
    await prisma.user.create({ data: { email, ...normalize(d) } });
  } catch {
    return { error: "อีเมลนี้มีอยู่แล้ว" };
  }
  revalidatePath("/users");
}

export async function updateUser(id: string, d: Data) {
  await requireRole(["ADMIN"]);
  await prisma.user.update({ where: { id }, data: normalize(d) });
  revalidatePath("/users");
}

export async function deleteUser(id: string) {
  await requireRole(["ADMIN"]);
  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return { error: "ลบไม่ได้ ผู้ใช้นี้มีข้อมูลการนิเทศอยู่ (แนะนำให้ปิดการใช้งานแทน)" };
  }
  revalidatePath("/users");
}
