import { NextRequest, NextResponse } from "next/server";
import { generateReport } from "@/lib/data/reports";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const report = await generateReport({
      teacherEmail: sp.get("teacherEmail") || undefined,
      subjectGroup: sp.get("subjectGroup") || undefined,
      dateFrom: sp.get("dateFrom") || undefined,
      dateTo: sp.get("dateTo") || undefined,
    });

    let csv = "ครู,กลุ่มสาระ,วันที่,วิชา,ห้อง,คะแนนรวม,ระดับคุณภาพ,ผู้นิเทศ\n";
    report.observations.forEach((o) => {
      const row = [
        o.teacher.name,
        o.subjectGroup ?? "",
        o.date.toISOString().slice(0, 10),
        o.subject ?? "",
        o.classRoom ?? "",
        o.overallScore,
        o.level,
        o.supervisor.name,
      ];
      csv += row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
    });

    return new NextResponse("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="supervision-report.csv"',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "error" }, { status: 403 });
  }
}
