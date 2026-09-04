import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { generateReport } from "@/lib/data/reports";
import { fmtDateTimeTH } from "@/lib/date";
import PrintTrigger from "@/components/reports/PrintTrigger";

export const dynamic = "force-dynamic";

type SP = Record<string, string | undefined>;

export default async function ReportPrintPage({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await auth();
  if (!session?.user || session.user.role === "TEACHER") redirect("/dashboard");

  const sp = await searchParams;
  const report = await generateReport(sp);

  return (
    <div className="max-w-3xl mx-auto p-8 text-sm">
      <PrintTrigger />
      <h1 className="text-xl font-bold mb-1">รายงานผลการนิเทศ</h1>
      <p className="text-text-muted mb-6">สร้างเมื่อ {fmtDateTimeTH(new Date())}</p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b-2 border-black">
            <th className="py-2 pr-3">ครู</th>
            <th className="py-2 pr-3">กลุ่มสาระ</th>
            <th className="py-2 pr-3">จำนวนครั้ง</th>
            <th className="py-2 pr-3">คะแนนเฉลี่ย</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(report.byTeacher).map((t, i) => (
            <tr key={i} className="border-b border-gray-300">
              <td className="py-2 pr-3">{t.name}</td>
              <td className="py-2 pr-3">{t.subjectGroup || "-"}</td>
              <td className="py-2 pr-3">{t.count}</td>
              <td className="py-2 pr-3">{t.avgScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-text-muted mt-6 no-print">
        กด Ctrl+P (หรือ Cmd+P) แล้วเลือก &ldquo;Save as PDF&rdquo; เพื่อบันทึกเป็นไฟล์ PDF
      </p>
    </div>
  );
}
