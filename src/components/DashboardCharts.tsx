"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { levelColor } from "@/lib/rubric";

const FOLLOWUP_COLORS: Record<string, string> = {
  รอติดตาม: "#ef6c00",
  อยู่ระหว่างพัฒนา: "#1565c0",
  เสร็จสิ้น: "#2e7d32",
};

export default function DashboardCharts({
  monthly,
  levelDist,
  followUp,
}: {
  monthly: Record<string, number>;
  levelDist: Record<string, number>;
  followUp: Record<string, number>;
}) {
  const monthlyData = Object.keys(monthly)
    .sort()
    .map((k) => ({ month: k, count: monthly[k] }));
  const levelData = Object.entries(levelDist).map(([label, value]) => ({ label, value }));
  const followUpData = Object.entries(followUp).map(([label, value]) => ({ label, value }));

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
        <h3 className="font-semibold mb-3">การนิเทศรายเดือน</h3>
        {monthlyData.length === 0 ? (
          <div className="text-center text-text-muted text-sm py-16">ยังไม่มีข้อมูล</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
        <h3 className="font-semibold mb-3">ระดับคุณภาพการสอน</h3>
        {levelData.every((d) => d.value === 0) ? (
          <div className="text-center text-text-muted text-sm py-16">ยังไม่มีข้อมูล</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={levelData} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80}>
                {levelData.map((d) => (
                  <Cell key={d.label} fill={levelColor(d.label)} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-5 md:col-span-2">
        <h3 className="font-semibold mb-3">สถานะการติดตามผล</h3>
        {followUpData.every((d) => d.value === 0) ? (
          <div className="text-center text-text-muted text-sm py-10">ยังไม่มีข้อมูล</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={followUpData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="label" fontSize={12} width={100} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {followUpData.map((d) => (
                  <Cell key={d.label} fill={FOLLOWUP_COLORS[d.label]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
