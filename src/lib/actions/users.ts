"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/enums";

type Data = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v).trim());

function normalize(d: Data) {
  return {
    // Email is optional: users without one can be evaluated / sit on committees
    // but cannot sign in until an admin adds their email.
    email: str(d.email).toLowerCase() || null,
    name: str(d.name),
    role: (str(d.role) || "TEACHER") as Role,
    position: str(d.position) || null,
    subjectGroupId: str(d.subjectGroupId) || null,
    active: d.active == null ? true : Boolean(d.active),
  };
}

export async function createUser(d: Data) {
  await requireRole(["ADMIN"]);
  if (!str(d.name)) return { error: "กรุณากรอกชื่อ-นามสกุล" };
  try {
    await prisma.user.create({ data: normalize(d) });
  } catch {
    return { error: "อีเมลนี้มีอยู่แล้ว" };
  }
  revalidatePath("/users");
}

export async function updateUser(id: string, d: Data) {
  await requireRole(["ADMIN"]);
  if (!str(d.name)) return { error: "กรุณากรอกชื่อ-นามสกุล" };
  try {
    await prisma.user.update({ where: { id }, data: normalize(d) });
  } catch {
    return { error: "อีเมลนี้มีอยู่แล้ว" };
  }
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
