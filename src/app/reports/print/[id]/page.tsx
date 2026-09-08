import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAssignment } from "@/lib/data/assignments";
import { getQualityLevelsForScoring, getSchool } from "@/lib/data/lookups";
import SummaryView from "@/components/summary/SummaryView";
import PrintTrigger from "@/components/reports/PrintTrigger";

export const dynamic = "force-dynamic";

export default async function PrintReportPage({ params }: PageProps<"/reports/print/[id]">) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const [assignment, levels, school] = await Promise.all([
    getAssignment(id),
    getQualityLevelsForScoring(),
    getSchool(),
  ]);
  if (!assignment) notFound();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-text">
      <PrintTrigger />
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">{school.name}</h1>
        <p className="text-sm text-text-muted">{school.department}</p>
        <h2 className="text-lg font-semibold mt-3">รายงานสรุปผลการประเมินนิเทศภายในโรงเรียน</h2>
      </div>
      <SummaryView assignment={assignment} levels={levels} variant="print" />
      <p className="text-center text-xs text-text-muted mt-10 print-only">
        ระบบนิเทศภายในโรงเรียน • {school.name}
      </p>
    </div>
  );
}
