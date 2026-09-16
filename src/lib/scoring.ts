// Scoring + quality-level helpers. The assessment form is DB-driven, so these
// functions take data rather than reading module constants.

export type QualityLevelLike = {
  minScore: number;
  maxScore: number;
  label: string;
  color: string;
  order: number;
};

// Seeded into the QualityLevel table and used as a runtime fallback when the
// table is empty. Matches the เกณฑ์ระดับคุณภาพ screen.
export const DEFAULT_QUALITY_LEVELS: QualityLevelLike[] = [
  { minScore: 3.51, maxScore: 4.0, label: "ดีมาก", color: "#7cb342", order: 1 },
  { minScore: 2.51, maxScore: 3.5, label: "ดี", color: "#f9a825", order: 2 },
  { minScore: 1.51, maxScore: 2.5, label: "พอใช้", color: "#fb8c00", order: 3 },
  { minScore: 1.0, maxScore: 1.5, label: "ปรับปรุง", color: "#e53935", order: 4 },
];

// The fixed 1-4 chip colors used by the rating form and score badges everywhere.
export const SCORE_COLORS: Record<number, string> = {
  4: "#7cb342",
  3: "#f9a825",
  2: "#fb8c00",
  1: "#e53935",
};

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function mean(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function levelFor(
  score: number | null | undefined,
  levels: QualityLevelLike[] = DEFAULT_QUALITY_LEVELS,
): QualityLevelLike | null {
  if (score == null || Number.isNaN(score)) return null;
  const sorted = [...levels].sort((a, b) => a.order - b.order);
  for (const lv of sorted) {
    if (score >= lv.minScore - 1e-9 && score <= lv.maxScore + 1e-9) return lv;
  }
  // Above the top band or below the bottom band -> clamp to nearest.
  if (sorted.length && score > sorted[0].maxScore) return sorted[0];
  return sorted[sorted.length - 1] ?? null;
}

// --- Assignment summary ------------------------------------------------------

export type SummaryInput = {
  domains: { id: string; name: string; order: number; items: { id: string; name: string; order: number }[] }[];
  evaluators: { userId: string; name: string }[];
  // scores[userId][itemId] = 1..4
  scores: Record<string, Record<string, number>>;
  levels?: QualityLevelLike[];
};

export type CellStat = {
  byEvaluator: Record<string, number | null>;
  avg: number | null;
  level: QualityLevelLike | null;
};

export type AssignmentSummary = {
  perItem: Record<string, CellStat>;
  perDomain: Record<string, CellStat>;
  overall: CellStat;
};

export function summarize(input: SummaryInput): AssignmentSummary {
  const { domains, evaluators, scores, levels = DEFAULT_QUALITY_LEVELS } = input;
  const perItem: Record<string, CellStat> = {};
  const perDomain: Record<string, CellStat> = {};

  const allItemAvgs: number[] = [];
  const overallByEvaluator: Record<string, number | null> = {};

  // per-evaluator running list of every item score they gave (across all domains)
  const evaluatorAllScores: Record<string, number[]> = {};
  for (const e of evaluators) evaluatorAllScores[e.userId] = [];

  for (const domain of domains) {
    const domainItemAvgs: number[] = [];
    const domainByEvaluator: Record<string, number[]> = {};
    for (const e of evaluators) domainByEvaluator[e.userId] = [];

    for (const item of domain.items) {
      const byEvaluator: Record<string, number | null> = {};
      const given: number[] = [];
      for (const e of evaluators) {
        const s = scores[e.userId]?.[item.id];
        if (typeof s === "number") {
          byEvaluator[e.userId] = s;
          given.push(s);
          domainByEvaluator[e.userId].push(s);
          evaluatorAllScores[e.userId].push(s);
        } else {
          byEvaluator[e.userId] = null;
        }
      }
      const avg = mean(given);
      if (avg != null) {
        domainItemAvgs.push(avg);
        allItemAvgs.push(avg);
      }
      perItem[item.id] = { byEvaluator, avg, level: levelFor(avg, levels) };
    }

    const domainByEvaluatorAvg: Record<string, number | null> = {};
    for (const e of evaluators) domainByEvaluatorAvg[e.userId] = mean(domainByEvaluator[e.userId]);
    const domainAvg = mean(domainItemAvgs);
    perDomain[domain.id] = {
      byEvaluator: domainByEvaluatorAvg,
      avg: domainAvg,
      level: levelFor(domainAvg, levels),
    };
  }

  for (const e of evaluators) overallByEvaluator[e.userId] = mean(evaluatorAllScores[e.userId]);
  const overallAvg = mean(allItemAvgs);

  return {
    perItem,
    perDomain,
    overall: { byEvaluator: overallByEvaluator, avg: overallAvg, level: levelFor(overallAvg, levels) },
  };
}
