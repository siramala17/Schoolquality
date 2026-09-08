import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { listAssignments } from "@/lib/data/assignments";
import { getQualityLevelsForScoring } from "@/lib/data/lookups";
import { buildSummary } from "@/lib/summary";
import { round2 } from "@/lib/scoring";
import { SectionTitle, EmptyState, LevelBadge } from "@/components/ui";

export default async function SummaryListPage() {
  await requireRole(["ADMIN", "EXECUTIVE"]);
  const [assignments, levels] = await Promise.all([listAssignments(), getQualityLevelsForScoring()]);

  return (
    <div>
      <SectionTitle icon="🧾" count={assignments.length}>
        สรุปผลการนิเทศ
      </SectionTitle>
      {assignments.length === 0 ? (
        <EmptyState>ยังไม่มีข้อมูล</EmptyState>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const s = buildSummary(a, levels);
            return (
              <Link
                key={a.id}
                href={`/summary/${a.id}`}
                className="flex items-center justify-between gap-3 bg-surface rounded-xl shadow-sm border border-border p-4 hover:border-primary transition-colors"
              >
                <div>
                  <div className="font-semibold">{a.teacher.name}</div>
                  <div className="text-xs text-text-muted">
                    {a.round.name} / {a.semester.name} / ปีการศึกษา {a.academicYear.year}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary">
                    {s.overall.avg == null ? "-" : round2(s.overall.avg).toFixed(2)}
                  </span>
                  <LevelBadge label={s.overall.level?.label} color={s.overall.level?.color} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
