"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/enums";

export async function upsertUser(input: {
  email: string;
  name: string;
  role: Role;
  subjectGroup?: string;
  position?: string;
  active: boolean;
}) {
  await requireRole(["ADMIN"]);
  const data = {
    name: input.name,
    role: input.role,
    subjectGroup: input.subjectGroup || null,
    position: input.position || null,
    active: input.active,
  };
  await prisma.user.upsert({
    where: { email: input.email },
    update: data,
    create: { email: input.email, ...data },
  });
  revalidatePath("/users");
}
