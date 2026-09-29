import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { REPORT_ROLES } from "@/lib/labels";
import { filtersFromSearchParams } from "@/lib/data/supervision-report";
import { getLearningRecords } from "@/lib/data/learning-record";
import { getAcademicYears, getRounds, getSemesters } from "@/lib/data/lookups";
import { SectionTitle, GradientButton } from "@/components/ui";
import { FilterBar, TeacherPicker } from "@/components/dashboard/DashboardControls";
import LearningRecord from "@/components/reports/LearningRecord";
import WordDownloadButton from "@/components/reports/WordDownloadButton";

export default async function LearningRecordPage({ searchParams }: PageProps<"/learning-record">) {
  await requireRole(REPORT_ROLES);
  const sp = await searchParams;
  const teacherId = typeof sp.teacher === "string" && sp.teacher ? sp.teacher : undefined;
  const [{ records, levels, school, teachers }, rounds, semesters, years] = await Promise.all([
    getLearningRecords({ ...filtersFromSearchParams(sp), teacherId }),
    getRounds(),
    getSemesters(),
    getAcademicYears(),
  ]);

  const query = new URLSearchParams();
  for (const key of ["round", "semester", "year", "teacher"]) {
    const v = sp[key];
    if (typeof v === "string" && v) query.set(key, v);
  }
  const fileName =
    records.length === 1 ? `แบบบันทึกการนิเทศการจัดการเรียนรู้_${records[0].teacher}` : "แบบบันทึกการนิเทศการจัดการเรียนรู้";

  return (
    <div className="space-y-4">
      <SectionTitle icon="📝" count={records.length}>
        สรุปแบบบันทึกการนิเทศการจัดการเรียนรู้
      </SectionTitle>
      <FilterBar
        rounds={rounds.map((r) => ({ id: r.id, name: r.name }))}
        semesters={semesters.map((s) => ({ id: s.id, name: s.name }))}
        years={years.map((y) => ({ id: y.id, name: y.year }))}
      />
      <TeacherPicker teachers={teachers} />
      {records.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2">
          <WordDownloadButton targetId="learning-record" fileName={fileName} />
          <Link href={`/reports/learning-record?${query}`} target="_blank">
            <GradientButton>⬇ ดาวน์โหลด PDF</GradientButton>
          </Link>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6 overflow-x-auto">
        <LearningRecord records={records} levels={levels} school={school} />
      </div>
    </div>
  );
}
