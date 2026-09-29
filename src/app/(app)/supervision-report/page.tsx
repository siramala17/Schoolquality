import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { REPORT_ROLES } from "@/lib/labels";
import { filtersFromSearchParams, getSupervisionReport } from "@/lib/data/supervision-report";
import { SectionTitle, GradientButton } from "@/components/ui";
import { FilterBar } from "@/components/dashboard/DashboardControls";
import SupervisionReport from "@/components/reports/SupervisionReport";
import WordDownloadButton from "@/components/reports/WordDownloadButton";

export default async function SupervisionReportPage({ searchParams }: PageProps<"/supervision-report">) {
  await requireRole(REPORT_ROLES);
  const sp = await searchParams;
  const { parts, school, period, options } = await getSupervisionReport(filtersFromSearchParams(sp));

  const query = new URLSearchParams();
  for (const key of ["round", "semester", "year"]) {
    const v = sp[key];
    if (typeof v === "string" && v) query.set(key, v);
  }

  return (
    <div className="space-y-4">
      <SectionTitle icon="🗂️" count={parts.reduce((n, p) => n + p.report.rows.length, 0)}>
        รายงานผลการนิเทศตามกลุ่มสาระ
      </SectionTitle>
      <FilterBar rounds={options.rounds} semesters={options.semesters} years={options.years} />
      {parts.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2">
          <WordDownloadButton targetId="supervision-report" fileName="ผลการนิเทศชั้นเรียนและสังเกตการสอน" />
          <Link href={`/reports/supervision-summary?${query}`} target="_blank">
            <GradientButton>⬇ ดาวน์โหลด PDF</GradientButton>
          </Link>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6 overflow-x-auto">
        <SupervisionReport parts={parts} school={school} period={period} />
      </div>
    </div>
  );
}
