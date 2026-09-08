import { requireUser } from "@/lib/auth-helpers";
import { getDashboardData, getTeacherRoundBreakdown } from "@/lib/data/dashboard";
import { getRounds, getSemesters, getAcademicYears, getTeachers, getQualityLevelsForScoring } from "@/lib/data/lookups";
import { KpiCard, Card, LevelBadge, EmptyState } from "@/components/ui";
import { FilterBar, TeacherPicker } from "@/components/dashboard/DashboardControls";
import {
  TeacherBars,
  DomainBars,
  LevelDonut,
  RoundBars,
  DomainGroupedBars,
} from "@/components/dashboard/DashboardCharts";
import { DEFAULT_QUALITY_LEVELS } from "@/lib/scoring";

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  await requireUser();
  const sp = await searchParams;
  const roundId = typeof sp.round === "string" ? sp.round : undefined;
  const semesterId = typeof sp.semester === "string" ? sp.semester : undefined;
  const yearId = typeof sp.year === "string" ? sp.year : undefined;
  const teacherId = typeof sp.teacher === "string" ? sp.teacher : undefined;

  const [data, rounds, semesters, years, teachers, levels] = await Promise.all([
    getDashboardData({ roundId, semesterId, yearId }),
    getRounds(),
    getSemesters(),
    getAcademicYears(),
    getTeachers(),
    getQualityLevelsForScoring(),
  ]);

  const palette = (levels.length ? levels : DEFAULT_QUALITY_LEVELS).map((l) => ({ label: l.label, color: l.color }));
  const levelDistData = palette.map((p) => ({ label: p.label, value: data.levelDist[p.label] ?? 0 }));

  const breakdown = teacherId ? await getTeacherRoundBreakdown(teacherId, levels) : null;
  const pickedTeacher = teachers.find((t) => t.id === teacherId);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard icon="🧑‍💼" label="ผู้บริหาร" value={data.kpi.executives} />
        <KpiCard icon="🧑‍🏫" label="ครูทั้งหมด" value={data.kpi.teachers} />
        <KpiCard icon="📨" label="ยื่นประเมินแล้ว" value={data.kpi.assigned} tone="primary" />
        <KpiCard icon="⏳" label="กำลังประเมิน" value={data.kpi.inProgress} tone="warn" />
        <KpiCard icon="✅" label="ประเมินเสร็จแล้ว" value={data.kpi.completed} tone="good" />
      </div>

      <FilterBar
        rounds={rounds.map((r) => ({ id: r.id, name: r.name }))}
        semesters={semesters.map((s) => ({ id: s.id, name: s.name }))}
        years={years.map((y) => ({ id: y.id, name: y.year }))}
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold mb-3">📈 คะแนนเฉลี่ยของครูแต่ละคน</h3>
          <TeacherBars data={data.perTeacher} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">📊 คะแนนเฉลี่ยแต่ละด้าน</h3>
          <DomainBars data={data.perDomain} />
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-3">🥧 สัดส่วนจำนวนระดับคุณภาพ</h3>
        <LevelDonut data={levelDistData} palette={palette} />
      </Card>

      <TeacherPicker teachers={teachers.map((t) => ({ id: t.id, name: t.name }))} />

      {pickedTeacher && breakdown && (
        <div className="space-y-5">
          <h3 className="font-semibold">
            ผลการประเมินรายครั้งของ: <span className="text-primary">{pickedTeacher.name}</span>
          </h3>

          <Card>
            <h4 className="font-semibold mb-3">คะแนนเฉลี่ยภาพรวมแต่ละครั้ง</h4>
            <RoundBars data={breakdown.map((b) => ({ label: b.label, avg: b.avg }))} />
          </Card>

          <Card>
            <h4 className="font-semibold mb-3">ตารางสรุปผลการนิเทศ</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/5 text-primary text-left">
                    <th className="px-3 py-2 font-semibold w-10">ที่</th>
                    <th className="px-3 py-2 font-semibold">รอบที่ (รอบ/ภาคเรียน/ปีการศึกษา)</th>
                    <th className="px-3 py-2 font-semibold text-center">คะแนนเฉลี่ย</th>
                    <th className="px-3 py-2 font-semibold">ระดับคุณภาพ</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b, i) => (
                    <tr key={b.id} className="border-t border-border">
                      <td className="px-3 py-2 text-text-muted">{i + 1}</td>
                      <td className="px-3 py-2">{b.label}</td>
                      <td className="px-3 py-2 text-center font-semibold text-primary">
                        {b.avg == null ? "-" : b.avg.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        {b.avg == null ? (
                          <span className="text-xs text-text-muted">รอการประเมิน</span>
                        ) : (
                          <LevelBadge label={b.level?.label} color={b.level?.color} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h4 className="font-semibold mb-3">คะแนนเฉลี่ยแต่ละด้านของแต่ละครั้ง</h4>
            <DomainGroupedBars rounds={breakdown.map((b) => ({ label: b.label, domains: b.domains }))} />
          </Card>
        </div>
      )}

      {pickedTeacher && breakdown && breakdown.length === 0 && <EmptyState>ยังไม่มีข้อมูลของครูท่านนี้</EmptyState>}
    </div>
  );
}
