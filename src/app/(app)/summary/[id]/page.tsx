import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { REPORT_ROLES } from "@/lib/labels";
import { getAssignment } from "@/lib/data/assignments";
import { getQualityLevelsForScoring } from "@/lib/data/lookups";
import { GradientButton } from "@/components/ui";
import SummaryView from "@/components/summary/SummaryView";

export default async function SummaryDetailPage({ params }: PageProps<"/summary/[id]">) {
  await requireRole(REPORT_ROLES);
  const { id } = await params;
  const [assignment, levels] = await Promise.all([getAssignment(id), getQualityLevelsForScoring()]);
  if (!assignment) notFound();

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 no-print">
        <Link href="/summary" className="text-sm text-primary hover:underline">
          ← กลับ
        </Link>
        <Link href={`/reports/print/${id}`} target="_blank">
          <GradientButton>🖨 พิมพ์ / ดาวน์โหลด PDF</GradientButton>
        </Link>
      </div>
      <h1 className="text-lg font-bold mb-4">สรุปผลการประเมินนิเทศ</h1>
      <SummaryView assignment={assignment} levels={levels} />
    </div>
  );
}
