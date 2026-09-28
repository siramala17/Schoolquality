import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { filtersFromSearchParams } from "@/lib/data/supervision-report";
import { getLearningRecords } from "@/lib/data/learning-record";
import LearningRecord from "@/components/reports/LearningRecord";
import PrintTrigger from "@/components/reports/PrintTrigger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "แบบบันทึกการนิเทศการจัดการเรียนรู้" };

export default async function PrintLearningRecordPage({ searchParams }: PageProps<"/reports/learning-record">) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "EXECUTIVE") redirect("/dashboard");

  const sp = await searchParams;
  const teacherId = typeof sp.teacher === "string" && sp.teacher ? sp.teacher : undefined;
  const { records, levels, school } = await getLearningRecords({ ...filtersFromSearchParams(sp), teacherId });

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-text">
      {records.length > 0 && <PrintTrigger />}
      <LearningRecord records={records} levels={levels} school={school} />
    </div>
  );
}
