import { prisma } from "@/lib/prisma";

export function getForm(id: string) {
  return prisma.assessmentForm.findUnique({
    where: { id },
    include: {
      domains: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export function getActiveForm() {
  return prisma.assessmentForm.findFirst({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      domains: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });
}
