// รายงาน "ผลการนิเทศชั้นเรียนและสังเกตการสอน" — จัดกลุ่มตามกลุ่มสาระการเรียนรู้
// พร้อมบทวิเคราะห์อัตโนมัติ. Pure function: takes loaded assignments, returns
// everything the report tables and the Word/PDF export need.
import { buildSummary } from "@/lib/summary";
import { levelFor, mean, round2, type QualityLevelLike } from "@/lib/scoring";
import type { listAssignments } from "@/lib/data/assignments";

type LoadedAssignment = Awaited<ReturnType<typeof listAssignments>>[number];

export const NO_GROUP = "ไม่ระบุกลุ่มสาระ";

export type ReportRow = {
  id: string;
  teacher: string;
  subjectGroup: string;
  classroom: string;
  avg: number;
  percent: number;
  level: QualityLevelLike | null;
  domainAvgs: Record<string, number | null>; // keyed by domain name
};

export type GroupStat = {
  name: string;
  rows: ReportRow[];
  avg: number;
  percent: number;
  level: QualityLevelLike | null;
  domainAvgs: Record<string, number | null>;
  levelCounts: Record<string, number>;
};

export type SupervisionReport = {
  maxScore: number;
  domainNames: string[];
  rows: ReportRow[];
  groups: GroupStat[];
  overall: {
    count: number;
    avg: number | null;
    percent: number | null;
    level: QualityLevelLike | null;
    domainAvgs: Record<string, number | null>;
    levelCounts: Record<string, number>;
    levelDist: { label: string; color: string; count: number }[]; // every level, best first
  };
  analysis: {
    overview: string[];
    byGroup: { name: string; text: string }[];
    byDomain: string[];
    suggestions: string[];
  };
};

export function fmt2(n: number | null | undefined) {
  return n == null ? "-" : round2(n).toFixed(2);
}

function domainAvgsOf(rows: ReportRow[], domainNames: string[]) {
  const out: Record<string, number | null> = {};
  for (const d of domainNames) {
    out[d] = mean(rows.map((r) => r.domainAvgs[d]).filter((v): v is number => v != null));
  }
  return out;
}

function countLevels(rows: ReportRow[]) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = r.level?.label ?? "ไม่ระบุ";
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

function pct(n: number, total: number) {
  return total ? round2((n / total) * 100).toFixed(2) : "0.00";
}

function rankDomains(domainAvgs: Record<string, number | null>) {
  return Object.entries(domainAvgs)
    .filter((e): e is [string, number] => e[1] != null)
    .sort((a, b) => b[1] - a[1]);
}

export function buildSupervisionReport(
  assignments: LoadedAssignment[],
  levels: QualityLevelLike[],
): SupervisionReport {
  const maxScore = Math.max(...levels.map((l) => l.maxScore), 1);
  const sortedLevels = [...levels].sort((a, b) => a.order - b.order);

  // Domain columns: union of domain names in form order.
  const domainNames: string[] = [];
  for (const a of assignments) {
    for (const d of a.form.domains) if (!domainNames.includes(d.name)) domainNames.push(d.name);
  }

  const groupOrder = new Map<string, number>();
  const rows: ReportRow[] = [];
  for (const a of assignments) {
    const s = buildSummary(a, levels);
    if (s.overall.avg == null) continue; // ยังไม่มีกรรมการส่งผลประเมิน
    const group = a.subjectGroup ?? a.teacher.subjectGroup;
    const groupName = group?.name ?? NO_GROUP;
    if (!groupOrder.has(groupName)) groupOrder.set(groupName, group ? group.order : Number.MAX_SAFE_INTEGER);

    const domainAvgs: Record<string, number | null> = {};
    for (const d of a.form.domains) domainAvgs[d.name] = s.perDomain[d.id]?.avg ?? null;

    rows.push({
      id: a.id,
      teacher: a.teacher.name,
      subjectGroup: groupName,
      classroom: a.classroom?.name ?? "-",
      avg: s.overall.avg,
      percent: (s.overall.avg / maxScore) * 100,
      level: s.overall.level,
      domainAvgs,
    });
  }

  rows.sort(
    (x, y) =>
      groupOrder.get(x.subjectGroup)! - groupOrder.get(y.subjectGroup)! ||
      x.subjectGroup.localeCompare(y.subjectGroup, "th") ||
      x.teacher.localeCompare(y.teacher, "th"),
  );

  const groups: GroupStat[] = [];
  for (const r of rows) {
    let g = groups.find((x) => x.name === r.subjectGroup);
    if (!g) {
      g = { name: r.subjectGroup, rows: [], avg: 0, percent: 0, level: null, domainAvgs: {}, levelCounts: {} };
      groups.push(g);
    }
    g.rows.push(r);
  }
  for (const g of groups) {
    g.avg = mean(g.rows.map((r) => r.avg))!;
    g.percent = (g.avg / maxScore) * 100;
    g.level = levelFor(g.avg, levels);
    g.domainAvgs = domainAvgsOf(g.rows, domainNames);
    g.levelCounts = countLevels(g.rows);
  }

  const overallAvg = mean(rows.map((r) => r.avg));
  const overall = {
    count: rows.length,
    avg: overallAvg,
    percent: overallAvg == null ? null : (overallAvg / maxScore) * 100,
    level: levelFor(overallAvg, levels),
    domainAvgs: domainAvgsOf(rows, domainNames),
    levelCounts: countLevels(rows),
    levelDist: [] as { label: string; color: string; count: number }[],
  };
  overall.levelDist = sortedLevels.map((l) => ({ label: l.label, color: l.color, count: overall.levelCounts[l.label] ?? 0 }));

  // --- บทวิเคราะห์ ----------------------------------------------------------
  const analysis: SupervisionReport["analysis"] = { overview: [], byGroup: [], byDomain: [], suggestions: [] };

  if (rows.length > 0) {
    const teacherCount = new Set(rows.map((r) => r.teacher)).size;
    analysis.overview.push(
      `ผลการนิเทศชั้นเรียนและสังเกตการสอนครูจำนวน ${teacherCount} คน (${rows.length} ครั้ง) ` +
        `จาก ${groups.length} กลุ่มสาระการเรียนรู้ มีค่าเฉลี่ยรวม ${fmt2(overall.avg)} จากคะแนนเต็ม ${maxScore} ` +
        `คิดเป็นร้อยละ ${fmt2(overall.percent)} อยู่ในระดับ${overall.level?.label ?? "-"}`,
    );
    const dist = sortedLevels
      .filter((l) => overall.levelCounts[l.label])
      .map((l) => `ระดับ${l.label} ${overall.levelCounts[l.label]} คน (ร้อยละ ${pct(overall.levelCounts[l.label], rows.length)})`);
    if (dist.length) analysis.overview.push(`จำแนกตามระดับการประเมิน: ${dist.join(", ")}`);

    if (groups.length > 1) {
      const ranked = [...groups].sort((a, b) => b.avg - a.avg);
      const top = ranked[0];
      const bottom = ranked[ranked.length - 1];
      analysis.overview.push(
        `กลุ่มสาระที่มีค่าเฉลี่ยสูงสุด คือ ${top.name} (${fmt2(top.avg)}, ร้อยละ ${fmt2(top.percent)}) ` +
          `และกลุ่มสาระที่มีค่าเฉลี่ยต่ำสุด คือ ${bottom.name} (${fmt2(bottom.avg)}, ร้อยละ ${fmt2(bottom.percent)})`,
      );
    }

    for (const g of groups) {
      const ranked = rankDomains(g.domainAvgs);
      const best = [...g.rows].sort((a, b) => b.avg - a.avg)[0];
      let text =
        `มีครูรับการนิเทศ ${g.rows.length} ครั้ง ค่าเฉลี่ย ${fmt2(g.avg)} (ร้อยละ ${fmt2(g.percent)}) ` +
        `อยู่ในระดับ${g.level?.label ?? "-"}`;
      if (ranked.length > 1) {
        const [hi, lo] = [ranked[0], ranked[ranked.length - 1]];
        text += ` ด้านที่โดดเด่นที่สุดคือ${hi[0]} (${fmt2(hi[1])})`;
        if (lo[1] < hi[1]) text += ` และด้านที่ควรพัฒนาคือ${lo[0]} (${fmt2(lo[1])})`;
      }
      if (g.rows.length > 1) text += ` ผู้ที่มีผลการประเมินสูงสุดในกลุ่มคือ ${best.teacher} (${fmt2(best.avg)})`;
      analysis.byGroup.push({ name: g.name, text });
    }

    const rankedDomains = rankDomains(overall.domainAvgs);
    rankedDomains.forEach(([name, avg], i) => {
      analysis.byDomain.push(
        `${i + 1}. ${name} ค่าเฉลี่ย ${fmt2(avg)} (ร้อยละ ${fmt2((avg / maxScore) * 100)}) ระดับ${levelFor(avg, levels)?.label ?? "-"}`,
      );
    });

    if (rankedDomains.length > 1) {
      const [lowName, lowAvg] = rankedDomains[rankedDomains.length - 1];
      analysis.suggestions.push(
        `ควรส่งเสริมและพัฒนาครูใน${lowName} ซึ่งมีค่าเฉลี่ยต่ำที่สุด (${fmt2(lowAvg)}) ` +
          `เช่น จัดอบรมเชิงปฏิบัติการ หรือกิจกรรมชุมชนการเรียนรู้ทางวิชาชีพ (PLC) ในประเด็นดังกล่าว`,
      );
      const [highName] = rankedDomains[0];
      analysis.suggestions.push(`ควรต่อยอดจุดเด่นใน${highName} โดยคัดเลือกแนวปฏิบัติที่ดี (Best Practice) มาเผยแพร่ภายในโรงเรียน`);
    }
    if (groups.length > 1) {
      const bottom = [...groups].sort((a, b) => a.avg - b.avg)[0];
      analysis.suggestions.push(`ควรนิเทศติดตามและให้คำแนะนำเพิ่มเติมแก่กลุ่มสาระ${bottom.name.replace(/^กลุ่มสาระ(การเรียนรู้)?/, "")}`);
    }
    // ต่ำกว่าระดับที่ 2 จากบน (เช่น ต่ำกว่า "ดี") → ต้องติดตามเป็นรายบุคคล
    const goodBand = sortedLevels[1];
    if (goodBand) {
      const weak = rows.filter((r) => r.avg < goodBand.minScore - 1e-9);
      if (weak.length) {
        analysis.suggestions.push(
          `ครูที่มีผลการประเมินต่ำกว่าระดับ${goodBand.label} ควรได้รับการนิเทศแบบกัลยาณมิตรและติดตามผลอย่างใกล้ชิด ได้แก่ ` +
            weak.map((r) => `${r.teacher} (${fmt2(r.avg)})`).join(", "),
        );
      }
    }
  }

  return { maxScore, domainNames, rows, groups, overall, analysis };
}
