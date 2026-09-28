import SummaryView from "@/components/summary/SummaryView";
import type { FullAssignment } from "@/lib/data/assignments";
import type { QualityLevelLike } from "@/lib/scoring";

export default function PrintReport({
  assignment,
  levels,
  school,
  className = "",
}: {
  assignment: NonNullable<FullAssignment>;
  levels: QualityLevelLike[];
  school: { name: string; department: string };
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">{school.name}</h1>
        <p className="text-sm text-text-muted">{school.department}</p>
        <h2 className="text-lg font-semibold mt-3">รายงานสรุปผลการประเมินนิเทศภายในโรงเรียน</h2>
      </div>
      <SummaryView assignment={assignment} levels={levels} variant="print" />
      <p className="text-center text-xs text-text-muted mt-10 print-only">
        ระบบนิเทศภายในโรงเรียน • {school.name}
      </p>
    </section>
  );
}
