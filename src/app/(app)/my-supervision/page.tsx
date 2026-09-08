import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { assignmentsForTeacher } from "@/lib/data/assignments";
import { getQualityLevelsForScoring } from "@/lib/data/lookups";
import { buildSummary } from "@/lib/summary";
import { round2 } from "@/lib/scoring";
import { SectionTitle, EmptyState, LevelBadge, StatusPill } from "@/components/ui";
import { ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_CLASS } from "@/lib/labels";

export default async function MySupervisionPage() {
  const user = await requireUser();
  const [assignments, levels] = await Promise.all([
    assignmentsForTeacher(user.id),
    getQualityLevelsForScoring(),
  ]);

  return (
    <div>
      <SectionTitle icon="🎓" count={assignments.length}>
        ผลการนิเทศของฉัน
      </SectionTitle>
      {assignments.length === 0 ? (
        <EmptyState>ยังไม่มีการนิเทศ</EmptyState>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const s = buildSummary(a, levels);
            return (
              <Link
                key={a.id}
                href={`/my-supervision/${a.id}`}
                className="flex items-center justify-between gap-3 bg-surface rounded-xl shadow-sm border border-border p-4 hover:border-primary transition-colors"
              >
                <div>
                  <div className="font-semibold">
                    {a.round.name} / {a.semester.name} / ปีการศึกษา {a.academicYear.year}
                  </div>
                  <div className="mt-1">
                    <StatusPill
                      label={a.acknowledgedAt ? "รับทราบแล้ว" : ASSIGNMENT_STATUS_LABELS[a.status]}
                      className={a.acknowledgedAt ? "bg-emerald-50 text-emerald-700" : ASSIGNMENT_STATUS_CLASS[a.status]}
                    />
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
