import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { REPORT_ROLES } from "@/lib/labels";
import { listAssignments } from "@/lib/data/assignments";
import { getQualityLevelsForScoring } from "@/lib/data/lookups";
import { buildSummary } from "@/lib/summary";
import { round2 } from "@/lib/scoring";
import { ASSIGNMENT_STATUS_LABELS } from "@/lib/labels";
import { fmtDateTH } from "@/lib/date";

function csvCell(v: string | number | null | undefined) {
  const s = v == null ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function fmt(n: number | null | undefined) {
  return n == null ? "" : round2(n).toFixed(2);
}

// ดาวน์โหลดผลการนิเทศของครูทุกคนเป็นไฟล์ CSV (เปิดด้วย Excel ได้)
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!REPORT_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const [assignments, levels] = await Promise.all([listAssignments(), getQualityLevelsForScoring()]);

  // Forms can differ, so domain columns are the union of domain names in form order.
  const domainNames: string[] = [];
  for (const a of assignments) {
    for (const d of a.form.domains) if (!domainNames.includes(d.name)) domainNames.push(d.name);
  }

  const header = [
    "ลำดับ",
    "ชื่อ-นามสกุล",
    "ตำแหน่ง",
    "กลุ่มสาระ",
    "รอบที่",
    "ภาคเรียน",
    "ปีการศึกษา",
    "ชั้นเรียน",
    "แบบประเมิน",
    ...domainNames.map((n) => `เฉลี่ย ${n}`),
    "คะแนนเฉลี่ยรวม",
    "ระดับคุณภาพ",
    "กรรมการประเมินแล้ว",
    "สถานะ",
    "ครูรับทราบเมื่อ",
  ];

  const rows = assignments.map((a, i) => {
    const s = buildSummary(a, levels);
    const byName = new Map(a.form.domains.map((d) => [d.name, s.perDomain[d.id]?.avg]));
    return [
      i + 1,
      a.teacher.name,
      a.teacher.position,
      a.subjectGroup?.name ?? a.teacher.subjectGroup?.name,
      a.round.name,
      a.semester.name,
      a.academicYear.year,
      a.classroom?.name,
      a.form.name,
      ...domainNames.map((n) => fmt(byName.get(n))),
      fmt(s.overall.avg),
      s.overall.level?.label,
      `${s.progress.submitted}/${s.progress.total}`,
      ASSIGNMENT_STATUS_LABELS[a.status],
      a.acknowledgedAt ? fmtDateTH(a.acknowledgedAt) : "",
    ];
  });

  // BOM so Excel reads the Thai text as UTF-8.
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const fileName = `ผลการนิเทศ_ทั้งหมด_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="results.csv"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "no-store",
    },
  });
}
