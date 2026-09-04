import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function getAllUsers() {
  await requireRole(["ADMIN"]);
  return prisma.user.findMany({ orderBy: { name: "asc" } });
}
