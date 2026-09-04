import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTeachers } from "@/lib/data/lookups";
import ObservationForm from "@/components/observation/ObservationForm";

export default async function ObservationPage() {
  const session = await auth();
  if (!session?.user || session.user.role === "TEACHER") redirect("/dashboard");

  const [teachers, plans] = await Promise.all([
    getTeachers(),
    prisma.plan.findMany({
      where: { status: "SCHEDULED" },
      include: { teacher: true },
      orderBy: { date: "asc" },
    }),
  ]);

  return <ObservationForm teachers={teachers} plans={plans} />;
}
