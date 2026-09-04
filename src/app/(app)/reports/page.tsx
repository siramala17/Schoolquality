import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { generateReport } from "@/lib/data/reports";
import { getTeachers, getSubjectGroups } from "@/lib/data/lookups";
import { Card, EmptyState } from "@/components/ui";

type SP = Record<string, string | undefined>;

export default async function ReportsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await auth();
  if (!session?.user || session.user.role === "TEACHER") redirect("/dashboard");

  const sp = await searchParams;
  const [teachers, subjectGroups, report] = await Promise.all([
    getTeachers(),
    getSubjectGroups(),
    generateReport(sp),
  ]);

  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-semibold mb-3">สร้างรายงาน</h3>
        <form className="grid md:grid-cols-4 gap-3 items-end" action="/reports">
          <label className="flex flex-col gap-1.5 text-xs text-text-muted">
            ครู
            <select
              name="teacherEmail"
              defaultValue={sp.teacherEmail || ""}
              className="rounded-lg border border-border px-3 py-2 text-sm bg-surface"
            >
              <option value="">ทั้งหมด</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.email}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-text-muted">
            กลุ่มสาระ
            <select
              name="subjectGroup"
              defaultValue={sp.subjectGroup || ""}
              className="rounded-lg border border-border px-3 py-2 text-sm bg-surface"
            >
              <option value="">ทั้งหมด</option>
              {subjectGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-text-muted">
            ตั้งแต่วันที่
            <input
              type="date"
              name="dateFrom"
              defaultValue={sp.dateFrom || ""}
              className="rounded-lg border border-border px-3 py-2 text-sm bg-surface"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-text-muted">
            ถึงวันที่
            <input
              type="date"
              name="dateTo"
              defaultValue={sp.dateTo || ""}
              className="rounded-lg border border-border px-3 py-2 text-sm bg-surface"
            />
          </label>
          <div className="md:col-span-4 flex flex-wrap gap-2 mt-1">
            <button className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-dark">
              สร้างรายงาน
            </button>
            <a
              href={`/api/reports/csv${qs ? `?${qs}` : ""}`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-bg"
            >
              ส่งออก Excel (CSV)
            </a>
            <a
              href={`/reports/print${qs ? `?${qs}` : ""}`}
              target="_blank"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-bg"
            >
              ส่งออก PDF
            </a>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">สรุปผลการนิเทศ ({report.totalObservations} ครั้ง)</h3>
        {Object.keys(report.byTeacher).length === 0 ? (
          <EmptyState>ไม่พบข้อมูลตามเงื่อนไขที่เลือก</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted uppercase border-b-2 border-border">
                <th className="px-3 py-2">ครู</th>
                <th className="px-3 py-2">กลุ่มสาระ</th>
                <th className="px-3 py-2">จำนวนครั้ง</th>
                <th className="px-3 py-2">คะแนนเฉลี่ย</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(report.byTeacher).map((t, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">{t.name}</td>
                  <td className="px-3 py-2">{t.subjectGroup || "-"}</td>
                  <td className="px-3 py-2">{t.count}</td>
                  <td className="px-3 py-2">{t.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
