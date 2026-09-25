// Imports teachers (no email) from a JSON list produced from the school's
// "ครูประจำวิชารายห้อง" timetable spreadsheet:
//   [{ "name": "นางพรสุข พัฒเพ็ง", "sg": "วิทยาศาสตร์และเทคโนโลยี" }, ...]
// `sg` is the subject-group name (or null) and must match a SubjectGroup row.
//
//   npx tsx prisma/scripts/import-teachers.ts path/to/teachers.json          (dry run)
//   npx tsx prisma/scripts/import-teachers.ts path/to/teachers.json --yes    (write)
//
// Safe to re-run: a teacher whose name (ignoring spaces) already exists is skipped.

import { readFileSync } from "node:fs";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const file = process.argv[2];
const CONFIRMED = process.argv.includes("--yes");
const key = (s: string) => s.replace(/\s+/g, "");

async function main() {
  if (!file) throw new Error("usage: import-teachers.ts <teachers.json> [--yes]");
  const list: { name: string; sg: string | null }[] = JSON.parse(readFileSync(file, "utf8"));

  const groups = new Map((await prisma.subjectGroup.findMany()).map((g) => [g.name, g.id]));
  const existing = new Set((await prisma.user.findMany({ select: { name: true } })).map((u) => key(u.name)));

  const missingGroups = [...new Set(list.map((t) => t.sg).filter((g): g is string => !!g && !groups.has(g)))];
  if (missingGroups.length) throw new Error(`Unknown subject groups: ${missingGroups.join(", ")}`);

  const toAdd = list.filter((t) => !existing.has(key(t.name)));
  console.log(`${list.length} teachers in file, ${list.length - toAdd.length} already exist, ${toAdd.length} to add.`);

  if (!CONFIRMED) {
    console.log("Dry run only — re-run with --yes to write.");
    return;
  }

  const { count } = await prisma.user.createMany({
    data: toAdd.map((t) => ({
      name: t.name,
      role: "TEACHER" as const,
      subjectGroupId: t.sg ? groups.get(t.sg)! : null,
    })),
  });
  console.log(`Done ✓  added ${count} teachers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
