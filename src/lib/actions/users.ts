"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { ROLE_LABELS, USER_GROUPS, isUserGroup, type UserGroup } from "@/lib/labels";
import type { Role } from "@/generated/prisma/enums";

type Data = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v).trim());
const isRole = (v: string): v is Role => v in ROLE_LABELS;

function normalize(group: UserGroup, d: Data) {
  // Any role may be chosen (changing it moves the user to that role's tab);
  // fall back to the registering tab's role when none was given.
  const role = isRole(str(d.role)) ? (str(d.role) as Role) : USER_GROUPS[group].roles[0];
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
  const me = await requireRole(["ADMIN"]);
  if (!isUserGroup(group)) return { error: "ประเภทผู้ใช้งานไม่ถูกต้อง" };
  if (!str(d.name)) return { error: "กรุณากรอกชื่อ-นามสกุล" };
  const data = normalize(group, d);
  // Prevent admins locking themselves out of user management.
  if (id === me.id && (data.role !== "ADMIN" || !data.active)) {
    return { error: "ไม่สามารถเปลี่ยนบทบาทหรือปิดการใช้งานบัญชีของตนเองได้" };
  }
  try {
    await prisma.user.update({ where: { id }, data });
  } catch {
    return { error: "อีเมลนี้มีอยู่แล้ว" };
  }
  revalidatePath("/users");
}

export async function deleteUser(id: string) {
  const me = await requireRole(["ADMIN"]);
  if (id === me.id) return { error: "ไม่สามารถลบบัญชีของตนเองได้" };
  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return { error: "ลบไม่ได้ ผู้ใช้นี้มีข้อมูลการนิเทศอยู่ (แนะนำให้ปิดการใช้งานแทน)" };
  }
  revalidatePath("/users");
}
