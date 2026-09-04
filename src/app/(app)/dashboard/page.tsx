import { getDashboardData } from "@/lib/data/dashboard";
import { KpiCard, Card, EmptyState } from "@/components/ui";
import DashboardCharts from "@/components/DashboardCharts";
import { fmtDateTH } from "@/lib/date";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <KpiCard label="ครูทั้งหมด" value={data.kpi.totalTeachers} />
        <KpiCard label="จำนวนครั้งที่นิเทศ" value={data.kpi.totalObservations} />
        <KpiCard label="นิเทศแล้ว" value={data.kpi.observedCount} tone="good" />
        <KpiCard label="ยังไม่ได้นิเทศ" value={data.kpi.notObservedCount} tone="warn" />
        <KpiCard label="คะแนนเฉลี่ยการสอน" value={data.kpi.avgScore || "-"} />
      </div>

      <DashboardCharts monthly={data.monthly} levelDist={data.levelDist} followUp={data.followUp} />

      <Card>
        <h3 className="font-semibold mb-3">แผนนิเทศที่ใกล้ถึง</h3>
        {data.upcomingPlans.length === 0 ? (
          <EmptyState>ไม่มีแผนนิเทศที่ใกล้ถึง</EmptyState>
        ) : (
          <div className="space-y-2">
            {data.upcomingPlans.map((p) => (
              <div key={p.id} className="border border-border rounded-lg px-3 py-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{p.teacher.name}</span>
                  <span>{fmtDateTH(p.date)}</span>
                </div>
                <div className="text-xs text-text-muted mt-0.5">{p.topic || p.subjectGroup || ""}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
