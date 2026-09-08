import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { listAssignments } from "@/lib/data/assignments";
import { getQualityLevelsForScoring } from "@/lib/data/lookups";
import { buildSummary } from "@/lib/summary";
import { round2 } from "@/lib/scoring";
import { SectionTitle, EmptyState, LevelBadge, StatusPill } from "@/components/ui";
import { ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_CLASS } from "@/lib/labels";

export default async function ResultsPage() {
  await requireRole(["ADMIN", "EXECUTIVE"]);
  const [assignments, levels] = await Promise.all([listAssignments(), getQualityLevelsForScoring()]);

  const rows = assignments.map((a) => {
    const s = buildSummary(a, levels);
    return {
      id: a.id,
      teacher: a.teacher.name,
      context: `${a.round.name} / ${a.semester.name} / ${a.academicYear.year}`,
      classroom: a.classroom?.name ?? "-",
      avg: s.overall.avg,
      level: s.overall.level,
      progress: `${s.progress.submitted}/${s.progress.total}`,
      status: a.status,
    };
  });

  return (
    <div>
      <SectionTitle icon="📈" count={rows.length}>
        ผลการนิเทศทั้งหมด
      </SectionTitle>
      {rows.length === 0 ? (
        <EmptyState>ยังไม่มีข้อมูลการนิเทศ</EmptyState>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 text-primary text-left">
                  <th className="px-4 py-3 font-semibold">ครู</th>
                  <th className="px-4 py-3 font-semibold">รอบ / ภาคเรียน / ปี</th>
                  <th className="px-4 py-3 font-semibold">ชั้นเรียน</th>
                  <th className="px-4 py-3 font-semibold text-center">กรรมการ</th>
                  <th className="px-4 py-3 font-semibold text-center">คะแนนเฉลี่ย</th>
                  <th className="px-4 py-3 font-semibold">ระดับคุณภาพ</th>
                  <th className="px-4 py-3 font-semibold">สถานะ</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.teacher}</td>
                    <td className="px-4 py-3 text-text-muted">{r.context}</td>
                    <td className="px-4 py-3">{r.classroom}</td>
                    <td className="px-4 py-3 text-center">{r.progress}</td>
                    <td className="px-4 py-3 text-center font-semibold text-primary">
                      {r.avg == null ? "-" : round2(r.avg).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <LevelBadge label={r.level?.label} color={r.level?.color} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill label={ASSIGNMENT_STATUS_LABELS[r.status]} className={ASSIGNMENT_STATUS_CLASS[r.status]} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/summary/${r.id}`} className="text-primary hover:underline">
                        ดูสรุป →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
