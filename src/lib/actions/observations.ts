"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { computeScores, RUBRIC } from "@/lib/rubric";
import { revalidatePath } from "next/cache";

export type SubmitObservationInput = {
  planId?: string;
  teacherId: string;
  date: string;
  subject?: string;
  classRoom?: string;
  subjectGroup?: string;
  scores: Record<string, number[]>;
  feedback?: { strengths?: string; improvements?: string; suggestions?: string };
};

export async function submitObservation(input: SubmitObservationInput) {
  const user = await requireRole(["ADMIN", "EXECUTIVE"]);

  const complete = RUBRIC.every((d) => (input.scores[d.key] ?? []).every((v) => v >= 1 && v <= 5));
  if (!complete) throw new Error("กรุณาให้คะแนนครบทุกรายการ");

  const { domainScores, overallScore, level } = computeScores(input.scores);

  const obs = await prisma.observation.create({
    data: {
      planId: input.planId || null,
      date: new Date(input.date),
      subjectGroup: input.subjectGroup || null,
      classRoom: input.classRoom || null,
      subject: input.subject || null,
      scoresJson: JSON.stringify(input.scores),
      domainScoresJson: JSON.stringify(domainScores),
      overallScore,
      level,
      supervisorId: user.id,
      teacherId: input.teacherId,
    },
  });

  if (input.planId) {
    await prisma.plan.update({ where: { id: input.planId }, data: { status: "DONE" } });
  }

  const fb = input.feedback;
  if (fb && (fb.strengths || fb.improvements || fb.suggestions)) {
    await prisma.feedback.create({
      data: {
        observationId: obs.id,
        strengths: fb.strengths || null,
        improvements: fb.improvements || null,
        suggestions: fb.suggestions || null,
        status: "PENDING",
      },
    });
  }

  revalidatePath("/observation");
  revalidatePath("/plans");
  revalidatePath("/feedback");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return obs.id;
}
