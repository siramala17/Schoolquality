import { requireRole } from "@/lib/auth-helpers";
import { listAssignments } from "@/lib/data/assignments";
import { getPossibleCommitteeMembers } from "@/lib/data/lookups";
import { ROLE_LABELS } from "@/lib/labels";
import { SectionTitle } from "@/components/ui";
import CommitteeManager from "@/components/committee/CommitteeManager";

export default async function CommitteePage() {
  await requireRole(["ADMIN"]);
  const [assignments, candidates] = await Promise.all([listAssignments(), getPossibleCommitteeMembers()]);

  return (
    <div>
      <SectionTitle icon="🧑‍⚖️" count={assignments.length}>
        แต่งตั้งกรรมการ
      </SectionTitle>
      <CommitteeManager
        assignments={assignments.map((a) => ({
          id: a.id,
          teacherName: a.teacher.name,
          label: `${a.round.name} / ${a.semester.name} / ปีการศึกษา ${a.academicYear.year}`,
          status: a.status,
          members: a.committee.map((c) => ({
            userId: c.userId,
            name: c.user.name,
            roleLabel: c.roleLabel,
            submitted: !!c.evaluation?.submittedAt,
          })),
        }))}
        candidates={candidates.map((c) => ({ id: c.id, name: c.name, role: ROLE_LABELS[c.role] }))}
      />
    </div>
  );
}
