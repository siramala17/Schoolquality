"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

type Data = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v).trim());

async function guard() {
  await requireRole(["ADMIN"]);
}

/* ---- Form ---- */
export async function createForm(d: Data) {
  await guard();
  if (!str(d.name)) return { error: "กรุณากรอกชื่อแบบประเมิน" };
  await prisma.assessmentForm.create({
    data: { name: str(d.name), active: d.active == null ? true : Boolean(d.active) },
  });
  revalidatePath("/assessment-forms");
}
export async function updateForm(id: string, d: Data) {
  await guard();
  await prisma.assessmentForm.update({
    where: { id },
    data: { name: str(d.name), active: Boolean(d.active) },
  });
  revalidatePath("/assessment-forms");
  revalidatePath(`/assessment-forms/${id}`);
}
export async function deleteForm(id: string) {
  await guard();
  try {
    await prisma.assessmentForm.delete({ where: { id } });
  } catch {
    return { error: "ลบไม่ได้ แบบประเมินนี้ถูกใช้ในการมอบหมายแล้ว" };
  }
  revalidatePath("/assessment-forms");
}

/* ---- Domain ---- */
export async function addDomain(formId: string, name: string) {
  await guard();
  const count = await prisma.domain.count({ where: { formId } });
  await prisma.domain.create({ data: { formId, name: name.trim() || `ด้านที่ ${count + 1}`, order: count + 1 } });
  revalidatePath(`/assessment-forms/${formId}`);
}
export async function renameDomain(id: string, name: string) {
  await guard();
  const d = await prisma.domain.update({ where: { id }, data: { name: name.trim() } });
  revalidatePath(`/assessment-forms/${d.formId}`);
}
export async function deleteDomain(id: string) {
  await guard();
  const d = await prisma.domain.delete({ where: { id } });
  revalidatePath(`/assessment-forms/${d.formId}`);
}

/* ---- Item ---- */
export async function addItem(domainId: string, name: string) {
  await guard();
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) return;
  const count = await prisma.item.count({ where: { domainId } });
  await prisma.item.create({ data: { domainId, name: name.trim(), order: count + 1 } });
  revalidatePath(`/assessment-forms/${domain.formId}`);
}
export async function renameItem(id: string, name: string) {
  await guard();
  const item = await prisma.item.update({
    where: { id },
    data: { name: name.trim() },
    include: { domain: true },
  });
  revalidatePath(`/assessment-forms/${item.domain.formId}`);
}
export async function deleteItem(id: string) {
  await guard();
  const item = await prisma.item.delete({ where: { id }, include: { domain: true } });
  revalidatePath(`/assessment-forms/${item.domain.formId}`);
}
