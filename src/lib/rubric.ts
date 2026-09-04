export type RubricDomain = { key: string; name: string; items: string[] };

// 5 ด้านตามแบบสังเกตการสอน แต่ละด้านมีรายการประเมินย่อย ให้คะแนน 1-5
export const RUBRIC: RubricDomain[] = [
  {
    key: "prep",
    name: "การเตรียมการสอน",
    items: [
      "มีแผนการจัดการเรียนรู้ที่ชัดเจน สอดคล้องกับตัวชี้วัด",
      "เตรียมสื่อ ใบงาน และแหล่งเรียนรู้ล่วงหน้า",
      "กำหนดเป้าหมายการเรียนรู้ที่วัดผลได้ชัดเจน",
    ],
  },
  {
    key: "activity",
    name: "การจัดกิจกรรมการเรียนรู้",
    items: [
      "จัดกิจกรรมเน้นผู้เรียนเป็นสำคัญ (Active Learning)",
      "ลำดับขั้นตอนกิจกรรมเหมาะสมกับเวลาและเนื้อหา",
      "ส่งเสริมการคิดวิเคราะห์และการแก้ปัญหา",
    ],
  },
  {
    key: "media",
    name: "การใช้สื่อและเทคโนโลยี",
    items: [
      "เลือกใช้สื่อ/เทคโนโลยีเหมาะสมกับเนื้อหาและผู้เรียน",
      "ใช้สื่อได้อย่างคล่องแคล่วและมีประสิทธิภาพ",
      "ส่งเสริมให้ผู้เรียนใช้เทคโนโลยีเพื่อการเรียนรู้",
    ],
  },
  {
    key: "assess",
    name: "การวัดและประเมินผล",
    items: [
      "มีเครื่องมือวัดผลสอดคล้องกับจุดประสงค์การเรียนรู้",
      "ประเมินผลระหว่างเรียน (Formative Assessment) อย่างต่อเนื่อง",
      "ให้ข้อมูลย้อนกลับ (Feedback) แก่ผู้เรียนอย่างเหมาะสม",
    ],
  },
  {
    key: "classroom",
    name: "การจัดการชั้นเรียน",
    items: [
      "สร้างบรรยากาศที่เอื้อต่อการเรียนรู้",
      "ดูแลพฤติกรรมผู้เรียนอย่างเหมาะสม",
      "บริหารเวลาในชั้นเรียนได้อย่างมีประสิทธิภาพ",
    ],
  },
];

export type Level = { min: number; max: number; label: string; color: string };

export const LEVELS: Level[] = [
  { min: 4.51, max: 5.0, label: "ดีเยี่ยม", color: "#2e7d32" },
  { min: 3.51, max: 4.5, label: "ดีมาก", color: "#558b2f" },
  { min: 2.51, max: 3.5, label: "ดี", color: "#f9a825" },
  { min: 1.51, max: 2.5, label: "พอใช้", color: "#ef6c00" },
  { min: 1.0, max: 1.5, label: "ควรพัฒนา", color: "#c62828" },
];

export function getLevelForScore(score: number): Level {
  for (const lv of LEVELS) {
    if (score >= lv.min && score <= lv.max) return lv;
  }
  return LEVELS[LEVELS.length - 1];
}

export function levelColor(label: string): string {
  return LEVELS.find((l) => l.label === label)?.color ?? "#6b7280";
}

/** scores: { [domainKey]: number[] } -> { domainScores, overallScore, level } */
export function computeScores(scores: Record<string, number[]>) {
  const domainScores: Record<string, number> = {};
  let totalSum = 0;
  RUBRIC.forEach((domain) => {
    const vals = scores[domain.key] ?? [];
    const avg = vals.reduce((a, b) => a + b, 0) / domain.items.length;
    domainScores[domain.key] = Math.round(avg * 100) / 100;
    totalSum += avg;
  });
  const overallScore = Math.round((totalSum / RUBRIC.length) * 100) / 100;
  const level = getLevelForScore(overallScore).label;
  return { domainScores, overallScore, level };
}
