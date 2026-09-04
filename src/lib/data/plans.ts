import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export async function getPlans() {
  const user = await requireUser();
  return prisma.plan.findMany({
    where: user.role === "TEACHER" ? { teacherId: user.id } : {},
    include: { teacher: true, supervisor: true },
    orderBy: { date: "desc" },
  });
}
