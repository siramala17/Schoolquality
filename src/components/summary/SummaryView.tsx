import { Fragment } from "react";
import { buildSummary } from "@/lib/summary";
import { round2, type QualityLevelLike } from "@/lib/scoring";
import { LevelBadge } from "@/components/ui";
import { fmtDateTH } from "@/lib/date";
import type { FullAssignment } from "@/lib/data/assignments";

function fmt(n: number | null | undefined) {
  return n == null ? "-" : round2(n).toFixed(2);
}

export default function SummaryView({
  assignment,
  levels,
  variant = "screen",
}: {
  assignment: NonNullable<FullAssignment>;
  levels: QualityLevelLike[];
  variant?: "screen" | "print";
}) {
  const a = assignment;
  const s = buildSummary(a, levels);
  const submittedEvaluators = s.evaluators.filter((e) => e.submitted);

  const noteBlocks: { title: string; key: "strengths" | "improvements" | "suggestions" }[] = [
    { title: "จุดเด่น", key: "strengths" },
    { title: "จุดที่ควรพัฒนา", key: "improvements" },
    { title: "ข้อเสนอแนะ", key: "suggestions" },
  ];

  const info = [
    ["ชื่อ-นามสกุล", a.teacher.name],
    ["ตำแหน่ง", a.teacher.position ?? "-"],
    ["รอบที่", a.round.name],
    ["ภาคเรียน", a.semester.name],
    ["ปีการศึกษา", a.academicYear.year],
    ["ชั้นเรียน", a.classroom?.name ?? "-"],
    ["กลุ่มสาระ", a.subjectGroup?.name ?? a.teacher.subjectGroup?.name ?? "-"],
  ];

  const evidence = a.committee.flatMap((c) => c.evaluation?.evidence ?? []);

  return (
    <div className="space-y-5">
      {/* info grid */}
      <div className="bg-surface rounded-xl border border-border p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {info.map(([label, value]) => (
          <div key={label}>
            <div className="text-xs text-text-muted">{label}</div>
            <div className="font-semibold text-sm">{value}</div>
          </div>
        ))}
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <div className="text-2xl font-bold text-primary">{fmt(s.overall.avg)}</div>
          <div className="text-xs text-text-muted">คะแนนเฉลี่ยรวม</div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <div className="text-lg font-bold" style={{ color: s.overall.level?.color }}>
            {s.overall.level?.label ?? "-"}
          </div>
          <div className="text-xs text-text-muted">ระดับคุณภาพ</div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {s.progress.submitted}/{s.progress.total}
          </div>
          <div className="text-xs text-text-muted">กรรมการประเมินแล้ว</div>
        </div>
      </div>

      {/* main table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/5 text-primary text-left">
                <th className="px-3 py-2.5 font-semibold min-w-52">รายการประเมิน</th>
                {submittedEvaluators.map((e) => (
                  <th key={e.userId} className="px-3 py-2.5 font-semibold text-center whitespace-nowrap">
                    {e.name}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-semibold text-center">เฉลี่ย</th>
                <th className="px-3 py-2.5 font-semibold text-center">ระดับคุณภาพ</th>
              </tr>
            </thead>
            <tbody>
              {a.form.domains.map((d, di) => {
                const dom = s.perDomain[d.id];
                return (
                  <Fragment key={d.id}>
                    <tr className="bg-bg/60">
                      <td
                        colSpan={submittedEvaluators.length + 3}
                        className="px-3 py-2 font-semibold text-primary-dark"
                      >
                        {d.name || `ด้านที่ ${di + 1}`}
                      </td>
                    </tr>
                    {d.items.map((it, i) => {
                      const cell = s.perItem[it.id];
                      return (
                        <tr key={it.id} className="border-t border-border">
                          <td className="px-3 py-2">
                            {i + 1}. {it.name}
                          </td>
                          {submittedEvaluators.map((e) => (
                            <td key={e.userId} className="px-3 py-2 text-center">
                              {cell?.byEvaluator[e.userId] ?? "-"}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center font-medium">{fmt(cell?.avg)}</td>
                          <td className="px-3 py-2 text-center">
                            <LevelBadge label={cell?.level?.label} color={cell?.level?.color} />
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t border-border bg-primary/5 font-semibold">
                      <td className="px-3 py-2">เฉลี่ย{d.name?.split(":")[0] || `ด้านที่ ${di + 1}`}</td>
                      {submittedEvaluators.map((e) => (
                        <td key={e.userId} className="px-3 py-2 text-center">
                          {fmt(dom?.byEvaluator[e.userId])}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center">{fmt(dom?.avg)}</td>
                      <td className="px-3 py-2 text-center">
                        <LevelBadge label={dom?.level?.label} color={dom?.level?.color} />
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
              <tr className="border-t-2 border-primary/30 bg-primary/10 font-bold">
                <td className="px-3 py-2.5">คะแนนเฉลี่ยรวม</td>
                {submittedEvaluators.map((e) => (
                  <td key={e.userId} className="px-3 py-2.5 text-center">
                    {fmt(s.overall.byEvaluator[e.userId])}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center">{fmt(s.overall.avg)}</td>
                <td className="px-3 py-2.5 text-center">
                  <LevelBadge label={s.overall.level?.label} color={s.overall.level?.color} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* aggregated notes */}
      <div className="bg-surface rounded-xl border border-border p-4 space-y-2 text-sm">
        {noteBlocks.map((b) => {
          const parts = a.committee
            .filter((c) => c.evaluation?.submittedAt && c.evaluation[b.key])
            .map((c) => `${c.evaluation![b.key]} (${c.user.name})`);
          return (
            <p key={b.key}>
              <span className="font-semibold">{b.title}:</span> {parts.length ? parts.join(" , ") : "-"}
            </p>
          );
        })}
      </div>

      {/* evidence */}
      {evidence.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">รูปภาพประกอบการนิเทศ</h3>
          <div className="flex flex-wrap gap-2">
            {evidence.map((ev) => (
              <img
                key={ev.id}
                src={`/api/evidence/${ev.id}`}
                alt={ev.fileName}
                className="w-24 h-24 object-cover rounded-lg border border-border"
              />
            ))}
          </div>
        </div>
      )}

      {/* teacher acknowledgement */}
      <div>
        <h3 className="text-sm font-semibold mb-2">การรับทราบผลการประเมินของครู</h3>
        <div className="bg-surface rounded-xl border border-border p-4 w-56 text-center">
          {a.acknowledgedAt ? (
            <>
              {a.teacherSignatureData ? (
                <img src={a.teacherSignatureData} alt="ลายมือชื่อ" className="h-16 mx-auto object-contain" />
              ) : (
                <div className="h-16" />
              )}
              <div className="font-semibold text-sm">{a.teacher.name}</div>
              <div className="text-xs text-text-muted">{a.teacher.position ?? ""}</div>
              <div className="text-xs text-text-muted">รับทราบเมื่อ {fmtDateTH(a.acknowledgedAt)}</div>
              <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                ✓ รับทราบเรียบร้อย
              </div>
            </>
          ) : (
            <div className="text-xs text-text-muted py-6">รอการรับทราบจากครู</div>
          )}
        </div>
      </div>

      {/* committee signatures */}
      <div>
        <h3 className="text-sm font-semibold mb-2">ลงชื่อกรรมการนิเทศ</h3>
        <div className={`flex flex-wrap gap-3 ${variant === "print" ? "" : "overflow-x-auto"}`}>
          {a.committee.map((c) => (
            <div key={c.id} className="bg-surface rounded-xl border border-border p-4 w-52 text-center shrink-0">
              {c.evaluation?.signatureData ? (
                <img src={c.evaluation.signatureData} alt="ลายมือชื่อ" className="h-16 mx-auto object-contain" />
              ) : (
                <div className="h-16 flex items-center justify-center text-text-muted text-xs">
                  {c.evaluation?.submittedAt ? "(ไม่มีลายมือชื่อ)" : "ยังไม่ได้ประเมิน"}
                </div>
              )}
              <div className="font-semibold text-sm">{c.user.name}</div>
              <div className="text-xs text-text-muted">{c.roleLabel ?? c.user.position ?? ""}</div>
              <div className="text-xs text-text-muted">{fmtDateTH(c.evaluation?.submittedAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
