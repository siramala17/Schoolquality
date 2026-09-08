import { summarize, type QualityLevelLike, type AssignmentSummary } from "@/lib/scoring";

type Assignment = {
  form: {
    domains: { id: string; name: string; order: number; items: { id: string; name: string; order: number }[] }[];
  };
  committee: {
    userId: string;
    user: { name: string };
    evaluation: {
      submittedAt: Date | null;
      scores: { itemId: string; score: number }[];
    } | null;
  }[];
};

export type BuiltSummary = AssignmentSummary & {
  evaluators: { userId: string; name: string; submitted: boolean }[];
  progress: { submitted: number; total: number };
};

export function buildSummary(assignment: Assignment, levels: QualityLevelLike[]): BuiltSummary {
  const evaluators = assignment.committee.map((c) => ({
    userId: c.userId,
    name: c.user.name,
    submitted: !!c.evaluation?.submittedAt,
  }));

  const scores: Record<string, Record<string, number>> = {};
  for (const c of assignment.committee) {
    if (!c.evaluation?.submittedAt) continue;
    scores[c.userId] = {};
    for (const s of c.evaluation.scores) scores[c.userId][s.itemId] = s.score;
  }

  const base = summarize({
    domains: assignment.form.domains,
    evaluators: evaluators.filter((e) => e.submitted).map((e) => ({ userId: e.userId, name: e.name })),
    scores,
    levels,
  });

  return {
    ...base,
    evaluators,
    progress: { submitted: evaluators.filter((e) => e.submitted).length, total: evaluators.length },
  };
}
