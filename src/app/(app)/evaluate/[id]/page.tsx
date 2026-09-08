import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { getCommitteeSeat } from "@/lib/data/assignments";
import EvaluateForm from "@/components/evaluate/EvaluateForm";

export default async function EvaluateDetailPage({ params }: PageProps<"/evaluate/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const seat = await getCommitteeSeat(id);
  if (!seat) notFound();
  if (seat.userId !== user.id && user.role !== "ADMIN") redirect("/evaluate");

  const a = seat.assignment;
  const scores: Record<string, number> = {};
  for (const s of seat.evaluation?.scores ?? []) scores[s.itemId] = s.score;

  return (
    <div>
      <Link href="/evaluate" className="text-sm text-primary hover:underline">
        ← กลับ
      </Link>
      <div className="mt-2">
        <EvaluateForm
          committeeMemberId={seat.id}
          teacherName={a.teacher.name}
          contextLabel={`${a.round.name} / ${a.semester.name} / ปีการศึกษา ${a.academicYear.year}${
            a.classroom ? ` · ${a.classroom.name}` : ""
          }${a.subjectGroup ? ` · ${a.subjectGroup.name}` : ""}`}
          domains={a.form.domains.map((d) => ({
            id: d.id,
            name: d.name,
            items: d.items.map((it) => ({ id: it.id, name: it.name })),
          }))}
          initial={{
            scores,
            strengths: seat.evaluation?.strengths ?? "",
            improvements: seat.evaluation?.improvements ?? "",
            suggestions: seat.evaluation?.suggestions ?? "",
            signatureData: seat.evaluation?.signatureData ?? null,
          }}
          evidence={(seat.evaluation?.evidence ?? []).map((e) => ({ id: e.id, fileName: e.fileName }))}
          submitted={!!seat.evaluation?.submittedAt}
        />
      </div>
    </div>
  );
}
