// Deletes every User with role = TEACHER, plus everything that references them:
// - Assignments where they are the teacher being evaluated (cascades to that
//   assignment's CommitteeMember / Evaluation / ItemScore / Evidence rows)
// - CommitteeMember seats where they served as an evaluator on someone else's
//   assignment (cascades to that seat's Evaluation / ItemScore / Evidence)
//
// This is IRREVERSIBLE. By default it only prints what it would delete.
// Run for real against your own DATABASE_URL:
//   npx tsx prisma/scripts/delete-all-teachers.ts --yes

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CONFIRMED = process.argv.includes("--yes");

async function main() {
  const teachers = await prisma.user.findMany({ where: { role: "TEACHER" } });

  if (teachers.length === 0) {
    console.log("No TEACHER users found. Nothing to do.");
    return;
  }

  console.log(`Found ${teachers.length} teacher(s):`);
  for (const t of teachers) console.log(`  - ${t.name} <${t.email}>`);

  const teacherIds = teachers.map((t) => t.id);
  const assignmentsOwned = await prisma.assignment.count({ where: { teacherId: { in: teacherIds } } });
  const seatsHeld = await prisma.committeeMember.count({ where: { userId: { in: teacherIds } } });

  console.log(`\nWill also delete:`);
  console.log(`  - ${assignmentsOwned} assignment(s) where a teacher is being evaluated`);
  console.log(`  - ${seatsHeld} committee seat(s) held by a teacher (as an evaluator)`);
  console.log(`  (each cascades to its own evaluations, item scores, and evidence photos)`);

  if (!CONFIRMED) {
    console.log("\nDry run only — nothing was deleted. Re-run with --yes to actually delete:");
    console.log("  npx tsx prisma/scripts/delete-all-teachers.ts --yes");
    return;
  }

  for (const t of teacherIds) {
    await prisma.assignment.deleteMany({ where: { teacherId: t } });
    await prisma.committeeMember.deleteMany({ where: { userId: t } });
  }
  const { count } = await prisma.user.deleteMany({ where: { id: { in: teacherIds } } });

  console.log(`\nDone ✓  Deleted ${count} teacher(s) and all related data.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
