"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function saveSchool(input: { name: string; department: string; address?: string | null }) {
  await requireRole(["ADMIN"]);
  const data = {
    name: input.name.trim(),
    department: input.department.trim(),
    address: input.address?.trim() || null,
  };
  await prisma.school.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
  revalidatePath("/", "layout");
}
