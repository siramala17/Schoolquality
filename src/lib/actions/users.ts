"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { USER_GROUPS, isUserGroup, type UserGroup } from "@/lib/labels";
import type { Role } from "@/generated/prisma/enums";

type Data = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v).trim());

function normalize(group: UserGroup, d: Data) {
  // Each registration group only allows its own roles; single-role groups
  // have no role field in the form, so fall back to the group's first role.
  const allowed = USER_GROUPS[group].roles;
  const role = allowed.includes(str(d.role) as Role) ? (str(d.role) as Role) : allowed[0];
  return {
    // Email is optional: users without one can be evaluated / sit on committees
    // but cannot sign in until an admin adds their email.
    email: str(d.email).toLowerCase() || null,
    name: str(d.name),
    role,
    position: str(d.position) || null,
    subjectGroupId: str(d.subjectGroupId) || null,
    active: d.active == null ? true : Boolean(d.active),
  };
}

export async function createUser(group: UserGroup, d: Data) {
  await requireRole(["ADMIN"]);
  if (!isUserGroup(group)) return { error: "ประเภทผู้ใช้งานไม่ถูกต้อง" };
  if (!str(d.name)) return { error: "กรุณากรอกชื่อ-นามสกุล" };
  try {
    await prisma.user.create({ data: normalize(group, d) });
  } catch {
    return { error: "อีเมลนี้มีอยู่แล้ว" };
  }
  revalidatePath("/users");
}

export async function updateUser(group: UserGroup, id: string, d: Data) {
  await requireRole(["ADMIN"]);
  if (!isUserGroup(group)) return { error: "ประเภทผู้ใช้งานไม่ถูกต้อง" };
  if (!str(d.name)) return { error: "กรุณากรอกชื่อ-นามสกุล" };
  try {
    await prisma.user.update({ where: { id }, data: normalize(group, d) });
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
