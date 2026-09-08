"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts";

type Level = { label: string; color: string } | null;

const f2 = (v: unknown) => (typeof v === "number" && v ? v.toFixed(2) : v == null ? "" : String(v));
const f2dash = (v: unknown) => (typeof v === "number" && v ? v.toFixed(2) : "-");

export function TeacherBars({
  data,
}: {
  data: { name: string; avg: number; level: Level }[];
}) {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 24, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="name" fontSize={11} tickLine={false} />
        <YAxis domain={[0, 5]} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip formatter={f2} />
        <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={64}>
          <LabelList dataKey="avg" position="top" fontSize={11} formatter={f2} />
          {data.map((d, i) => (
            <Cell key={i} fill={d.level?.color ?? "#94a3b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DomainBars({ data }: { data: { name: string; avg: number }[] }) {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 24, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="name" fontSize={10} tickLine={false} interval={0} />
        <YAxis domain={[0, 5]} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip formatter={f2} />
        <Bar dataKey="avg" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={64}>
          <LabelList dataKey="avg" position="top" fontSize={11} formatter={f2} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LevelDonut({
  data,
  palette,
}: {
  data: { label: string; value: number }[];
  palette: { label: string; color: string }[];
}) {
  const colorOf = (label: string) => palette.find((p) => p.label === label)?.color ?? "#94a3b8";
  const shown = data.filter((d) => d.value > 0);
  if (shown.length === 0) return <Empty />;
  return (
    <div>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={shown}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={shown.length > 1 ? 2 : 0}
            >
              {shown.map((d) => (
                <Cell key={d.label} fill={colorOf(d.label)} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {palette.map((p) => (
          <span key={p.label} className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="w-3 h-3 rounded-sm" style={{ background: p.color }} />
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RoundBars({ data }: { data: { label: string; avg: number | null }[] }) {
  const clean = data.map((d) => ({ label: d.label, avg: d.avg ?? 0, has: d.avg != null }));
  if (clean.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={clean} margin={{ top: 24, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="label" fontSize={10} tickLine={false} interval={0} />
        <YAxis domain={[0, 5]} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip formatter={f2dash} />
        <Bar dataKey="avg" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={80}>
          <LabelList dataKey="avg" position="top" fontSize={11} formatter={f2} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DomainGroupedBars({
  rounds,
}: {
  rounds: { label: string; domains: { name: string; avg: number | null }[] }[];
}) {
  const domainNames = Array.from(new Set(rounds.flatMap((r) => r.domains.map((d) => d.name))));
  const data = rounds.map((r) => {
    const row: Record<string, string | number> = { label: r.label };
    for (const dn of domainNames) row[dn] = r.domains.find((d) => d.name === dn)?.avg ?? 0;
    return row;
  });
  const colors = ["#0d9488", "#7cb342", "#fb8c00", "#3730a3", "#e53935"];
  if (domainNames.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="label" fontSize={10} tickLine={false} interval={0} />
        <YAxis domain={[0, 5]} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip formatter={f2dash} />
        {domainNames.map((dn, i) => (
          <Bar key={dn} dataKey={dn} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} maxBarSize={40} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return <div className="text-center text-text-muted text-sm py-16">ยังไม่มีข้อมูล</div>;
}
