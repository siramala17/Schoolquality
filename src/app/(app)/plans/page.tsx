import { getPlans } from "@/lib/data/plans";
import { getTeachers } from "@/lib/data/lookups";
import { auth } from "@/auth";
import { Card, EmptyState, StatusPill } from "@/components/ui";
import { PLAN_STATUS_LABELS, PLAN_STATUS_CLASS } from "@/lib/labels";
import { fmtDateTH } from "@/lib/date";
import NewPlanButton from "@/components/plans/NewPlanButton";
import CancelPlanButton from "@/components/plans/CancelPlanButton";

export default async function PlansPage() {
  const [plans, teachers, session] = await Promise.all([getPlans(), getTeachers(), auth()]);
  const canManage = session?.user.role === "ADMIN" || session?.user.role === "EXECUTIVE";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{canManage && <NewPlanButton teachers={teachers} />}</div>
      <Card className="p-0 overflow-x-auto">
        {plans.length === 0 ? (
          <EmptyState>ยังไม่มีแผนการนิเทศ</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted uppercase border-b-2 border-border">
                <th className="px-4 py-2.5">วันที่</th>
                <th className="px-4 py-2.5">ครู</th>
                <th className="px-4 py-2.5">กลุ่มสาระ</th>
                <th className="px-4 py-2.5">หัวข้อ</th>
                <th className="px-4 py-2.5">ผู้นิเทศ</th>
                <th className="px-4 py-2.5">สถานะ</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {fmtDateTH(p.date)}
                    {p.time ? ` ${p.time}` : ""}
                  </td>
                  <td className="px-4 py-2.5">{p.teacher.name}</td>
                  <td className="px-4 py-2.5">{p.subjectGroup || "-"}</td>
                  <td className="px-4 py-2.5">{p.topic || "-"}</td>
                  <td className="px-4 py-2.5">{p.supervisor.name}</td>
                  <td className="px-4 py-2.5">
                    <StatusPill label={PLAN_STATUS_LABELS[p.status]} className={PLAN_STATUS_CLASS[p.status]} />
                  </td>
                  <td className="px-4 py-2.5">
                    {canManage && p.status === "SCHEDULED" && <CancelPlanButton planId={p.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
