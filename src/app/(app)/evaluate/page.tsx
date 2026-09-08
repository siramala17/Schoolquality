import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { mySeats } from "@/lib/data/assignments";
import { SectionTitle, EmptyState, StatusPill } from "@/components/ui";

export default async function EvaluatePage() {
  const user = await requireUser();
  const seats = await mySeats(user.id);

  return (
    <div>
      <SectionTitle icon="✍️" count={seats.length}>
        แบบประเมินของฉัน
      </SectionTitle>
      {seats.length === 0 && <EmptyState>ยังไม่มีรายการที่ท่านได้รับแต่งตั้งเป็นกรรมการ</EmptyState>}
      <div className="space-y-3">
        {seats.map((s) => {
          const submitted = !!s.evaluation?.submittedAt;
          const a = s.assignment;
          return (
            <Link
              key={s.id}
              href={`/evaluate/${s.id}`}
              className="block bg-surface rounded-xl shadow-sm border border-border p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{a.teacher.name}</div>
                  <div className="text-xs text-text-muted">
                    {a.round.name} / {a.semester.name} / ปีการศึกษา {a.academicYear.year}
                    {a.classroom ? ` · ${a.classroom.name}` : ""}
                  </div>
                  {s.roleLabel && <div className="text-xs text-primary mt-0.5">{s.roleLabel}</div>}
                </div>
                <StatusPill
                  label={submitted ? "ประเมินแล้ว" : "รอประเมิน"}
                  className={submitted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
