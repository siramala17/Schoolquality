import Link from "next/link";
import { getObservations, getObservationDetail } from "@/lib/data/observations";
import { auth } from "@/auth";
import { Card, EmptyState, LevelBadge, StatusPill } from "@/components/ui";
import { levelColor, RUBRIC } from "@/lib/rubric";
import { FEEDBACK_STATUS_LABELS, FEEDBACK_STATUS_CLASS } from "@/lib/labels";
import { fmtDateTH } from "@/lib/date";
import TeacherResponseForm from "@/components/feedback/TeacherResponseForm";

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const [obsList, session] = await Promise.all([getObservations(), auth()]);
  const selectedId = id && obsList.some((o) => o.id === id) ? id : obsList[0]?.id;
  const detail = selectedId ? await getObservationDetail(selectedId) : null;
  const isSupervisor = session?.user.role === "ADMIN" || session?.user.role === "EXECUTIVE";
  const domainScores = detail ? (JSON.parse(detail.domainScoresJson) as Record<string, number>) : {};

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-5 items-start">
      <Card>
        <h3 className="font-semibold mb-3">ประวัติการนิเทศ / ติดตามผล</h3>
        {obsList.length === 0 ? (
          <EmptyState>ยังไม่มีข้อมูลการนิเทศ</EmptyState>
        ) : (
          <div className="space-y-2 max-h-[560px] overflow-y-auto">
            {obsList.map((o) => (
              <Link
                key={o.id}
                href={`/feedback?id=${o.id}`}
                className={`block border rounded-lg px-3 py-2 ${
                  o.id === selectedId ? "border-primary bg-indigo-50" : "border-border hover:border-primary"
                }`}
              >
                <div className="flex justify-between items-center gap-2 text-sm font-semibold">
                  <span className="truncate">{o.teacher.name}</span>
                  <LevelBadge label={o.level} color={levelColor(o.level)} />
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {fmtDateTH(o.date)} · {o.subject || o.subjectGroup || ""}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        {!detail ? (
          <EmptyState>เลือกรายการทางซ้ายเพื่อดูรายละเอียด</EmptyState>
        ) : (
          <div>
            <h3 className="font-semibold text-lg mb-3">
              {detail.teacher.name} — {fmtDateTH(detail.date)}
            </h3>
            <div className="bg-bg border border-border rounded-lg p-4 flex flex-wrap gap-6 mb-4">
              {RUBRIC.map((d) => (
                <div key={d.key} className="text-sm">
                  <div className="text-text-muted text-xs">{d.name}</div>
                  <div className="font-bold">{domainScores[d.key] ?? "-"}</div>
                </div>
              ))}
              <div className="text-sm">
                <div className="text-text-muted text-xs">คะแนนรวม</div>
                <div className="font-bold">{detail.overallScore}</div>
              </div>
              <div className="text-sm">
                <div className="text-text-muted text-xs mb-0.5">ระดับคุณภาพ</div>
                <LevelBadge label={detail.level} color={levelColor(detail.level)} />
              </div>
            </div>

            <div className="bg-bg border border-border rounded-lg p-4 mb-4 space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">จุดเด่น</h4>
                <p className="text-sm text-text-muted whitespace-pre-wrap">{detail.feedback?.strengths || "-"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">สิ่งที่ควรพัฒนา</h4>
                <p className="text-sm text-text-muted whitespace-pre-wrap">{detail.feedback?.improvements || "-"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">ข้อเสนอแนะ</h4>
                <p className="text-sm text-text-muted whitespace-pre-wrap">{detail.feedback?.suggestions || "-"}</p>
              </div>
            </div>

            {detail.feedback && (
              <div className="bg-bg border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm">การตอบกลับ/ความก้าวหน้าของครู</h4>
                  <StatusPill
                    label={FEEDBACK_STATUS_LABELS[detail.feedback.status]}
                    className={FEEDBACK_STATUS_CLASS[detail.feedback.status]}
                  />
                </div>
                {isSupervisor ? (
                  <p className="text-sm text-text-muted whitespace-pre-wrap">
                    {detail.feedback.teacherResponse || "ยังไม่มีการตอบกลับจากครู"}
                  </p>
                ) : (
                  <TeacherResponseForm
                    feedbackId={detail.feedback.id}
                    initialResponse={detail.feedback.teacherResponse || ""}
                    initialStatus={detail.feedback.status}
                  />
                )}
              </div>
            )}

            {detail.evidence.length > 0 && (
              <div className="bg-bg border border-border rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">หลักฐานที่เกี่ยวข้อง</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detail.evidence.map((ev) => (
                    <a
                      key={ev.id}
                      href={`/api/evidence/${ev.id}`}
                      target="_blank"
                      className="border border-border rounded-lg p-3 text-xs hover:border-primary block"
                    >
                      <div className="font-medium truncate">{ev.fileName}</div>
                      <div className="text-text-muted mt-1">{ev.uploader.name}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
