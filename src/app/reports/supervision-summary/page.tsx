import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { REPORT_ROLES } from "@/lib/labels";
import { filtersFromSearchParams, getSupervisionReport } from "@/lib/data/supervision-report";
import SupervisionReport from "@/components/reports/SupervisionReport";
import PrintTrigger from "@/components/reports/PrintTrigger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "ผลการนิเทศชั้นเรียนและสังเกตการสอน" };

export default async function PrintSupervisionSummaryPage({ searchParams }: PageProps<"/reports/supervision-summary">) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!REPORT_ROLES.includes(session.user.role)) redirect("/dashboard");

  const { parts, school, period } = await getSupervisionReport(filtersFromSearchParams(await searchParams));

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-text">
      {parts.length > 0 && <PrintTrigger />}
      <SupervisionReport parts={parts} school={school} period={period} />
    </div>
  );
}
