import type { CSSProperties, ReactNode } from "react";
import { fmt2 } from "@/lib/supervision-report";
import type { LearningRecord as RecordData } from "@/lib/learning-record";
import type { QualityLevelLike } from "@/lib/scoring";

// Inline styles (not Tailwind) so the same markup survives the Word (.doc) export.
// Word doesn't inherit font size into tables, so every block sets it explicitly.
const base: CSSProperties = { fontFamily: "'TH Sarabun New', Sarabun, sans-serif", fontSize: "16pt", lineHeight: 1.25 };
const p: CSSProperties = { ...base, margin: 0 };
const center: CSSProperties = { ...p, textAlign: "center", fontWeight: "bold" };
const part: CSSProperties = { ...p, fontWeight: "bold", marginTop: "8pt" };
const indent: CSSProperties = { ...p, paddingLeft: "32pt" };
const table: CSSProperties = { width: "100%", borderCollapse: "collapse", margin: "4pt 0" };
const td: CSSProperties = { ...base, border: "1px solid #000", padding: "1pt 4pt", verticalAlign: "top" };
const tdc: CSSProperties = { ...td, textAlign: "center" };
const th: CSSProperties = { ...tdc, fontWeight: "bold", verticalAlign: "middle", background: "#f2f2f2" };
const domainRow: CSSProperties = { ...td, fontWeight: "bold", background: "#fafafa" };
const domainAvg: CSSProperties = { ...tdc, fontWeight: "bold", background: "#fafafa" };
const totalLabel: CSSProperties = { ...td, fontWeight: "bold", textAlign: "right" };
const totalCell: CSSProperties = { ...tdc, fontWeight: "bold" };

const DOTS = "..............................";
const BOX = "☐";

const NOTE_SECTIONS: { title: string; key: keyof RecordData["notes"][number] | null }[] = [
  { title: "จุดเด่นของครูผู้สอน", key: "strengths" },
  { title: "จุดที่ควรพัฒนาของครูผู้สอน", key: "improvements" },
  { title: "สิ่งที่ครูผู้สอนทำแล้วประสบความสำเร็จในชั้นเรียน", key: null }, // ไม่มีในแบบประเมินออนไลน์ — เว้นให้กรอกเอง
  { title: "อื่น ๆ", key: "suggestions" },
];

function longDateTH(d: Date | null) {
  if (!d) return DOTS;
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Bangkok" });
}

function multiline(text: string | null | undefined): ReactNode {
  const lines = (text ?? "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return "-";
  return lines.map((l, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {l}
    </span>
  ));
}

export default function LearningRecord({
  records,
  levels,
  school,
}: {
  records: RecordData[];
  levels: QualityLevelLike[];
  school: { name: string; department: string };
}) {
  const legend = [...levels]
    .sort((a, b) => a.order - b.order)
    .map((l) => `${fmt2(l.minScore)} – ${fmt2(l.maxScore)} = ${l.label}`);
  const department = school.department.startsWith("สังกัด") ? school.department : `สังกัด${school.department}`;

  return (
    <div id="learning-record" style={{ ...base, color: "#000" }}>
      {records.length === 0 ? (
        <p style={{ ...p, textAlign: "center", color: "#6b7280" }}>ยังไม่มีผลการนิเทศที่ผู้สังเกตส่งแล้วในช่วงที่เลือก</p>
      ) : (
        records.map((r, i) => (
          <RecordSheet key={r.id} record={r} first={i === 0} school={school.name} department={department} legend={legend} />
        ))
      )}
    </div>
  );
}

function RecordSheet({
  record: r,
  first,
  school,
  department,
  legend,
}: {
  record: RecordData;
  first: boolean;
  school: string;
  department: string;
  legend: string[];
}) {
  const n = r.observers.length;

  return (
    <section>
      {/* Page break on the first paragraph: honoured by both Chrome print and Word. */}
      <p style={first ? center : { ...center, pageBreakBefore: "always", breakBefore: "page" }}>
        แบบบันทึกการนิเทศการจัดการเรียนรู้ ปีการศึกษา {r.year}
      </p>
      <p style={center}>{school}</p>
      <p style={center}>{department}</p>

      <p style={part}>ตอนที่ 1 ข้อมูลทั่วไป</p>
      <p style={p}>
        ชื่อผู้สอน {r.teacher}&nbsp;&nbsp;&nbsp;วันที่สังเกตชั้นเรียน {longDateTH(r.observedAt)}
      </p>
      <p style={p}>
        กลุ่มสาระการเรียนรู้ {r.subjectGroup ?? DOTS}&nbsp;&nbsp;&nbsp;{r.round} {r.semester}
      </p>
      <p style={p}>ชื่อหลักสูตรฯ {DOTS}{DOTS}</p>
      <p style={p}>
        ชื่อวิชา/เรื่องที่สอน {DOTS}&nbsp;ชั้น {r.classroom ?? "........"}&nbsp;คาบเรียนที่ ........
      </p>
      {r.observers.map((o, i) => (
        <p key={i} style={i === 0 ? p : indent}>
          {i === 0 && "ชื่อผู้สังเกต "}คนที่ {i + 1} {o.name}&nbsp;&nbsp;ตำแหน่ง {o.position || DOTS}
        </p>
      ))}

      <p style={part}>ตอนที่ 2 ข้อมูลชั้นเรียน</p>
      <p style={p}>
        จำนวนนักเรียนตามใบรายชื่อ ........ คน&nbsp;&nbsp;เป็นชาย ........ คน&nbsp;&nbsp;หญิง ........ คน&nbsp;&nbsp;มาเรียน ........ คน
      </p>
      <p style={p}>
        รูปแบบห้องเรียน&nbsp;&nbsp;{BOX} แบบธรรมดา&nbsp;&nbsp;{BOX} ห้อง Lab&nbsp;&nbsp;{BOX} อื่น ๆ ระบุ {DOTS}
      </p>
      <p style={p}>
        รูปแบบการจัดห้องเรียน&nbsp;&nbsp;{BOX} นั่งเรียงแถวแบบชั้นเรียนทั่วไป&nbsp;&nbsp;{BOX} จัดโต๊ะเป็นกลุ่ม&nbsp;&nbsp;{BOX} อื่น ๆ{" "}
        {DOTS}
      </p>

      <p style={part}>ตอนที่ 3 การสังเกตการเรียนการสอนตามสภาพจริง</p>
      <table style={table}>
        <thead>
          <tr>
            <th style={{ ...th, width: "6%" }} rowSpan={2}>
              ที่
            </th>
            <th style={th} rowSpan={2}>
              รายการประเมิน
            </th>
            <th style={th} colSpan={n}>
              ผู้สังเกต (คนที่)
            </th>
            <th style={{ ...th, width: "10%" }} rowSpan={2}>
              ค่าเฉลี่ย
            </th>
          </tr>
          <tr>
            {r.observers.map((_, i) => (
              <th key={i} style={{ ...th, width: "7%" }}>
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {r.domains.map((d, di) => [
              <tr key={`d${di}`}>
                <td style={domainRow} colSpan={2 + n}>
                  {di + 1}) {d.name}
                </td>
                <td style={domainAvg}>{fmt2(d.avg)}</td>
              </tr>,
              ...d.items.map((it, ii) => (
                <tr key={`d${di}i${ii}`}>
                  <td style={tdc}>{ii + 1}</td>
                  <td style={td}>{it.name}</td>
                  {it.scores.map((s, si) => (
                    <td key={si} style={tdc}>
                      {s ?? "-"}
                    </td>
                  ))}
                  <td style={tdc}>{fmt2(it.avg)}</td>
                </tr>
              )),
            ])}
          <tr>
            <td style={totalLabel} colSpan={2}>
              รวมคะแนน
            </td>
            {r.totals.map((t, i) => (
              <td key={i} style={totalCell}>
                {t}
              </td>
            ))}
            <td style={totalCell}>{fmt2(r.avg)}</td>
          </tr>
          <tr>
            <td style={totalLabel} colSpan={2}>
              คิดเป็นร้อยละ
            </td>
            <td style={totalCell} colSpan={n}>
              {fmt2(r.percent)}
            </td>
            <td style={totalCell}>{r.level?.label ?? "-"}</td>
          </tr>
        </tbody>
      </table>

      <p style={part}>สรุปผลการนิเทศ</p>
      <p style={indent}>
        ค่าเฉลี่ย {fmt2(r.avg)} คิดเป็นร้อยละ {fmt2(r.percent)} อยู่ในระดับ {r.level?.label ?? "-"}
      </p>
      <p style={indent}>เกณฑ์การแปลผล (ค่าเฉลี่ย): {legend.join("   ")}</p>

      <p style={part}>ตอนที่ 4 บันทึกผลการสังเกตหลังสอน</p>
      {NOTE_SECTIONS.map((sec) => (
        <div key={sec.title}>
          <p style={{ ...p, fontWeight: "bold" }}>{sec.title}</p>
          {r.observers.map((_, i) => (
            <p key={i} style={indent}>
              คนที่ {i + 1}&nbsp;&nbsp;{sec.key ? multiline(r.notes[i][sec.key]) : DOTS + DOTS + DOTS}
            </p>
          ))}
        </div>
      ))}
    </section>
  );
}
