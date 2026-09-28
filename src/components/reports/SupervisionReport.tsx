import type { CSSProperties } from "react";
import { fmt2, type SupervisionReport as Report } from "@/lib/supervision-report";
import type { ReportPart } from "@/lib/data/supervision-report";
import { GroupedHBarChart, HBarChart, SERIES_COLORS } from "@/components/reports/ReportCharts";

// Inline styles (not Tailwind) so the same markup survives the Word (.doc) export.
const table: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "14px", marginBottom: "16px" };
const cell: CSSProperties = { border: "1px solid #444", padding: "4px 6px", verticalAlign: "top" };
const th: CSSProperties = { ...cell, background: "#e6f2f0", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" };
const center: CSSProperties = { ...cell, textAlign: "center" };
const groupRow: CSSProperties = { ...cell, background: "#f3f4f6", fontWeight: "bold" };
const groupRowCenter: CSSProperties = { ...groupRow, textAlign: "center" };
const totalRow: CSSProperties = { ...cell, background: "#d7ebe8", fontWeight: "bold", textAlign: "center" };
const partTitle: CSSProperties = {
  fontSize: "19px",
  fontWeight: "bold",
  margin: "24px 0 4px",
  padding: "6px 10px",
  background: "#0f5c52",
  color: "#fff",
};
const h2: CSSProperties = { fontSize: "18px", fontWeight: "bold", margin: "20px 0 6px" };
const h3: CSSProperties = { fontSize: "16px", fontWeight: "bold", margin: "10px 0 6px 16px" };
const p: CSSProperties = { margin: "4px 0", textIndent: "32px", lineHeight: 1.6 };

export default function SupervisionReport({
  parts,
  school,
  period,
}: {
  parts: ReportPart[];
  school: { name: string };
  period: string;
}) {
  return (
    <div id="supervision-report" style={{ fontFamily: "'TH Sarabun New', Sarabun, sans-serif", color: "#111" }}>
      <h1 style={{ fontSize: "20px", fontWeight: "bold", textAlign: "center", margin: "0 0 4px" }}>
        ผลการนิเทศชั้นเรียนและสังเกตการสอน
      </h1>
      <p style={{ textAlign: "center", margin: "0 0 12px" }}>
        {school.name}
        {period && ` • ${period}`}
      </p>

      {parts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>ยังไม่มีผลการนิเทศที่กรรมการส่งแล้วในช่วงที่เลือก</p>
      ) : (
        <>
          {parts.map((part, i) => (
            <FormSection key={part.formId} no={i + 1} formName={part.formName} report={part.report} />
          ))}
          {parts.length > 1 && <FormComparison parts={parts} />}
        </>
      )}
    </div>
  );
}

function FormSection({ no, formName, report }: { no: number; formName: string; report: Report }) {
  const { rows, groups, domainNames, overall, analysis } = report;

  return (
    <section>
      <div style={partTitle}>
        ตอนที่ {no} {formName}
      </div>

      <h2 style={h2}>{no}.1 ร้อยละของผลการนิเทศชั้นเรียนและสังเกตการสอน</h2>
      <h3 style={h3}>ร้อยละของผลการนิเทศชั้นเรียนและสังเกตการสอน (ครู) เรียงตามกลุ่มสาระการเรียนรู้</h3>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>ลำดับ</th>
            <th style={th}>ผู้รับการนิเทศ</th>
            <th style={th}>กลุ่มสาระการเรียนรู้</th>
            <th style={th}>สอนระดับชั้น</th>
            <th style={th}>ร้อยละ</th>
            <th style={th}>ระดับการประเมิน</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td style={center}>{i + 1}</td>
              <td style={cell}>{r.teacher}</td>
              <td style={cell}>{r.subjectGroup}</td>
              <td style={center}>{r.classroom}</td>
              <td style={center}>{fmt2(r.percent)}</td>
              <td style={center}>{r.level?.label ?? "-"}</td>
            </tr>
          ))}
          <tr>
            <td style={totalRow} colSpan={4}>
              ร้อยละเฉลี่ยรวม
            </td>
            <td style={totalRow}>{fmt2(overall.percent)}</td>
            <td style={totalRow}>{overall.level?.label ?? "-"}</td>
          </tr>
        </tbody>
      </table>

      <h2 style={h2}>{no}.2 ค่าเฉลี่ยของผลการนิเทศชั้นเรียนและสังเกตการสอนแยกตามรายการประเมิน</h2>
      <h3 style={h3}>ค่าเฉลี่ยของผลการนิเทศชั้นเรียนและสังเกตการสอน (ครู) แยกตามรายการประเมิน</h3>
      <table style={table}>
        <thead>
          <tr>
            <th style={th} rowSpan={2}>
              ผู้รับการนิเทศ
            </th>
            <th style={th} colSpan={domainNames.length}>
              รายการประเมิน
            </th>
            <th style={th} rowSpan={2}>
              รวม
              <br />
              (ค่าเฉลี่ย)
            </th>
          </tr>
          <tr>
            {domainNames.map((d) => (
              <th key={d} style={th}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => [
            <tr key={`${g.name}-h`}>
              <td style={groupRow} colSpan={domainNames.length + 2}>
                {g.name}
              </td>
            </tr>,
            ...g.rows.map((r) => (
              <tr key={r.id}>
                <td style={cell}>{r.teacher}</td>
                {domainNames.map((d) => (
                  <td key={d} style={center}>
                    {fmt2(r.domainAvgs[d])}
                  </td>
                ))}
                <td style={center}>{fmt2(r.avg)}</td>
              </tr>
            )),
            <tr key={`${g.name}-avg`}>
              <td style={groupRow}>ค่าเฉลี่ย{g.name}</td>
              {domainNames.map((d) => (
                <td key={d} style={groupRowCenter}>
                  {fmt2(g.domainAvgs[d])}
                </td>
              ))}
              <td style={groupRowCenter}>{fmt2(g.avg)}</td>
            </tr>,
          ])}
          <tr>
            <td style={totalRow}>ค่าเฉลี่ยรวม</td>
            {domainNames.map((d) => (
              <td key={d} style={totalRow}>
                {fmt2(overall.domainAvgs[d])}
              </td>
            ))}
            <td style={totalRow}>{fmt2(overall.avg)}</td>
          </tr>
        </tbody>
      </table>

      <h2 style={h2}>{no}.3 สรุปผลการนิเทศชั้นเรียนและสังเกตการสอนจำแนกตามกลุ่มสาระการเรียนรู้</h2>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>ลำดับ</th>
            <th style={th}>กลุ่มสาระการเรียนรู้</th>
            <th style={th}>จำนวน (ครั้ง)</th>
            <th style={th}>ค่าเฉลี่ย</th>
            <th style={th}>ร้อยละ</th>
            <th style={th}>ระดับการประเมิน</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g, i) => (
            <tr key={g.name}>
              <td style={center}>{i + 1}</td>
              <td style={cell}>{g.name}</td>
              <td style={center}>{g.rows.length}</td>
              <td style={center}>{fmt2(g.avg)}</td>
              <td style={center}>{fmt2(g.percent)}</td>
              <td style={center}>{g.level?.label ?? "-"}</td>
            </tr>
          ))}
          <tr>
            <td style={totalRow} colSpan={2}>
              รวม
            </td>
            <td style={totalRow}>{overall.count}</td>
            <td style={totalRow}>{fmt2(overall.avg)}</td>
            <td style={totalRow}>{fmt2(overall.percent)}</td>
            <td style={totalRow}>{overall.level?.label ?? "-"}</td>
          </tr>
        </tbody>
      </table>

      <h2 style={h2}>{no}.4 แผนภูมิสรุปผลการนิเทศชั้นเรียนและสังเกตการสอน</h2>
      {groups.length > 1 ? (
        <HBarChart
          title={`แผนภูมิที่ ${no}.1 ค่าเฉลี่ยผลการนิเทศจำแนกตามกลุ่มสาระการเรียนรู้`}
          bars={groups.map((g) => ({ label: g.name, value: g.avg, note: `${g.rows.length} ครั้ง` }))}
          max={report.maxScore}
        />
      ) : (
        <HBarChart
          title={`แผนภูมิที่ ${no}.1 ค่าเฉลี่ยผลการนิเทศรายบุคคล (${groups[0].name})`}
          bars={rows.map((r) => ({ label: r.teacher, value: r.avg, note: r.classroom }))}
          max={report.maxScore}
        />
      )}
      <HBarChart
        title={`แผนภูมิที่ ${no}.2 ค่าเฉลี่ยผลการนิเทศจำแนกตามรายการประเมิน`}
        bars={domainNames
          .filter((d) => overall.domainAvgs[d] != null)
          .map((d) => ({ label: d, value: overall.domainAvgs[d]! }))}
        max={report.maxScore}
      />
      <HBarChart
        title={`แผนภูมิที่ ${no}.3 จำนวนครูจำแนกตามระดับการประเมิน`}
        bars={overall.levelDist.map((l) => ({ label: `ระดับ${l.label}`, value: l.count, color: l.color }))}
        max={Math.max(1, ...overall.levelDist.map((l) => l.count))}
        valueLabel={(v) => `${v} คน (ร้อยละ ${fmt2(overall.count ? (v / overall.count) * 100 : 0)})`}
        rightPad={130}
      />

      <h2 style={h2}>{no}.5 การวิเคราะห์ผลการนิเทศชั้นเรียนและสังเกตการสอน</h2>
      <h3 style={h3}>{no}.5.1 ภาพรวม</h3>
      {analysis.overview.map((t, i) => (
        <p key={i} style={p}>
          {t}
        </p>
      ))}
      <h3 style={h3}>{no}.5.2 จำแนกตามกลุ่มสาระการเรียนรู้</h3>
      {analysis.byGroup.map((g, i) => (
        <p key={g.name} style={p}>
          <b>
            {i + 1}. {g.name}
          </b>{" "}
          {g.text}
        </p>
      ))}
      <h3 style={h3}>{no}.5.3 จำแนกตามรายการประเมิน (เรียงจากมากไปน้อย)</h3>
      {analysis.byDomain.map((t, i) => (
        <p key={i} style={p}>
          {t}
        </p>
      ))}
      {analysis.suggestions.length > 0 && (
        <>
          <h3 style={h3}>{no}.5.4 ข้อเสนอแนะ</h3>
          {analysis.suggestions.map((t, i) => (
            <p key={i} style={p}>
              {i + 1}. {t}
            </p>
          ))}
        </>
      )}
    </section>
  );
}

// "แบบสังเกตชั้นเรียน (Classroom Observation) ครูผู้สอนภาษาต่างประเทศ" → "ครูผู้สอนภาษาต่างประเทศ"
function shortFormName(name: string) {
  return name.replace(/^แบบสังเกตชั้นเรียน\s*(\([^)]*\))?\s*/, "") || name;
}

function FormComparison({ parts }: { parts: ReportPart[] }) {
  const ranked = [...parts].sort((a, b) => (b.report.overall.avg ?? 0) - (a.report.overall.avg ?? 0));
  const [hi, lo] = [ranked[0], ranked[ranked.length - 1]];

  return (
    <section>
      <div style={partTitle}>สรุปเปรียบเทียบตามแบบประเมิน</div>
      <table style={{ ...table, marginTop: "12px" }}>
        <thead>
          <tr>
            <th style={th}>แบบประเมิน</th>
            <th style={th}>จำนวน (ครั้ง)</th>
            <th style={th}>ค่าเฉลี่ย</th>
            <th style={th}>ร้อยละ</th>
            <th style={th}>ระดับการประเมิน</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.formId}>
              <td style={cell}>{part.formName}</td>
              <td style={center}>{part.report.overall.count}</td>
              <td style={center}>{fmt2(part.report.overall.avg)}</td>
              <td style={center}>{fmt2(part.report.overall.percent)}</td>
              <td style={center}>{part.report.overall.level?.label ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <HBarChart
        title="แผนภูมิเปรียบเทียบค่าเฉลี่ยรวมตามแบบประเมิน"
        bars={parts.map((part, i) => ({
          label: shortFormName(part.formName),
          value: part.report.overall.avg ?? 0,
          color: SERIES_COLORS[i % SERIES_COLORS.length],
          note: `${part.report.overall.count} ครั้ง`,
        }))}
        max={parts[0].report.maxScore}
      />
      <GroupedHBarChart
        title="แผนภูมิเปรียบเทียบค่าเฉลี่ยรายการประเมินตามแบบประเมิน"
        categories={[...new Set(parts.flatMap((part) => part.report.domainNames))]}
        series={parts.map((part) => ({ name: shortFormName(part.formName), values: part.report.overall.domainAvgs }))}
        max={parts[0].report.maxScore}
      />
      {hi.report.overall.avg !== lo.report.overall.avg && (
        <p style={p}>
          ผลการนิเทศตาม{hi.formName} มีค่าเฉลี่ยสูงกว่า{lo.formName} (
          {fmt2(hi.report.overall.avg)} และ {fmt2(lo.report.overall.avg)} ตามลำดับ)
        </p>
      )}
    </section>
  );
}
