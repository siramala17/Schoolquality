import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { REPORT_ROLES } from "@/lib/labels";
import { listAssignments } from "@/lib/data/assignments";
import { getQualityLevelsForScoring, getSchool } from "@/lib/data/lookups";
import PrintReport from "@/components/reports/PrintReport";
import PrintTrigger from "@/components/reports/PrintTrigger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "ผลการนิเทศ_ทั้งหมด" };

export default async function PrintAllReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!REPORT_ROLES.includes(session.user.role)) redirect("/dashboard");

  const [assignments, levels, school] = await Promise.all([
    listAssignments(),
    getQualityLevelsForScoring(),
    getSchool(),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-text">
      {assignments.length > 0 ? (
        <PrintTrigger />
      ) : (
        <p className="text-center text-text-muted">ยังไม่มีข้อมูลการนิเทศ</p>
      )}
      {assignments.map((a, i) => (
        <PrintReport
          key={a.id}
          assignment={a}
          levels={levels}
          school={school}
          className={i < assignments.length - 1 ? "page-break-after mb-16" : ""}
        />
      ))}
    </div>
  );
}
