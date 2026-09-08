import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { getAssignment } from "@/lib/data/assignments";
import { getQualityLevelsForScoring } from "@/lib/data/lookups";
import { GradientButton } from "@/components/ui";
import SummaryView from "@/components/summary/SummaryView";
import AcknowledgeBox from "@/components/summary/AcknowledgeBox";

export default async function MySupervisionDetailPage({ params }: PageProps<"/my-supervision/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const [assignment, levels] = await Promise.all([getAssignment(id), getQualityLevelsForScoring()]);
  if (!assignment) notFound();
  if (assignment.teacherId !== user.id) redirect("/my-supervision");

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 no-print">
        <Link href="/my-supervision" className="text-sm text-primary hover:underline">
          ← กลับ
        </Link>
        <Link href={`/reports/print/${id}`} target="_blank">
          <GradientButton>🖨 พิมพ์รายงาน</GradientButton>
        </Link>
      </div>
      <h1 className="text-lg font-bold mb-4">สรุปผลการประเมินนิเทศ</h1>
      <SummaryView assignment={assignment} levels={levels} />
      {!assignment.acknowledgedAt && (
        <div className="mt-5">
          <AcknowledgeBox assignmentId={id} canAck={assignment.status === "COMPLETED"} />
        </div>
      )}
    </div>
  );
}
