// Creates the school's base lookup data on a fresh database: academic years,
// semesters, rounds, subject groups and the real classrooms from the 1/2569 timetable:
//   ม.1–3: /1–10 ปกติ, /11–12 MEP, /13 Gifted, /14 ขอบฟ้ากว้าง
//   ม.4–6: /1–8 ปกติ, /9 MEP, /10 Gifted
// Run against your own DATABASE_URL:
//   npx tsx prisma/scripts/seed-base-data.ts
//
// Safe to re-run: every row is matched by name and only created when missing.
// The only deletion is the unused placeholder rooms (e.g. "ม.1 MEP") from an
// earlier version of this script. It never creates users.

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ACTIVE_YEAR = "2569";
const YEARS = ["2568", "2569", "2570"];
const SEMESTERS = ["ภาคเรียนที่ 1", "ภาคเรียนที่ 2"];
const ROUNDS = ["รอบที่ 1", "รอบที่ 2"];
const SUBJECT_GROUPS = [
  "ภาษาไทย",
  "คณิตศาสตร์",
  "วิทยาศาสตร์และเทคโนโลยี",
  "สังคมศึกษา ศาสนาและวัฒนธรรม",
  "สุขศึกษาและพลศึกษา",
  "ศิลปะ",
  "การงานอาชีพ",
  "ภาษาต่างประเทศ",
];
const TRACK_BY_ROOM: Record<string, Record<number, string>> = {
  lower: { 11: "MEP", 12: "MEP", 13: "Gifted", 14: "ขอบฟ้ากว้าง" },
  upper: { 9: "MEP", 10: "Gifted" },
};
const CLASSROOMS = [1, 2, 3, 4, 5, 6].flatMap((level) => {
  const tracks = level <= 3 ? TRACK_BY_ROOM.lower : TRACK_BY_ROOM.upper;
  const rooms = level <= 3 ? 14 : 10;
  return Array.from({ length: rooms }, (_, i) => {
    const track = tracks[i + 1];
    return `ม.${level}/${i + 1}${track ? ` (${track})` : ""}`;
  });
});
// Placeholder rooms created by an earlier version of this script; removed if nothing uses them.
const OBSOLETE_CLASSROOMS = [1, 2, 3, 4, 5, 6].flatMap((l) => ["Gifted", "MEP", "ขอบฟ้ากว้าง"].map((t) => `ม.${l} ${t}`));

// Create each named row that doesn't exist yet; returns how many were added.
async function ensureNamed(
  model: {
    findFirst: (args: { where: { name: string } }) => Promise<unknown>;
    create: (args: { data: { name: string; order: number } }) => Promise<unknown>;
  },
  names: string[],
) {
  let added = 0;
  for (let i = 0; i < names.length; i++) {
    if (await model.findFirst({ where: { name: names[i] } })) continue;
    await model.create({ data: { name: names[i], order: i + 1 } });
    added++;
  }
  return added;
}

async function main() {
  await prisma.school.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "โรงเรียนเทศบาลวัดกลาง",
      department: "สำนักการศึกษาเทศบาลนครขอนแก่น",
      address: "อำเภอเมืองขอนแก่น จังหวัดขอนแก่น",
    },
  });

  for (const year of YEARS) {
    await prisma.academicYear.upsert({ where: { year }, update: {}, create: { year } });
  }
  // Exactly one active academic year.
  await prisma.academicYear.updateMany({ where: { year: { not: ACTIVE_YEAR } }, data: { active: false } });
  await prisma.academicYear.update({ where: { year: ACTIVE_YEAR }, data: { active: true } });

  const semesters = await ensureNamed(prisma.semester, SEMESTERS);
  const rounds = await ensureNamed(prisma.round, ROUNDS);
  const subjectGroups = await ensureNamed(prisma.subjectGroup, SUBJECT_GROUPS);
  const { count: removed } = await prisma.classroom.deleteMany({
    where: { name: { in: OBSOLETE_CLASSROOMS }, assignments: { none: {} } },
  });
  const classrooms = await ensureNamed(prisma.classroom, CLASSROOMS);
  // Keep classroom order consistent with CLASSROOMS even for rows that already existed.
  for (let i = 0; i < CLASSROOMS.length; i++) {
    await prisma.classroom.updateMany({ where: { name: CLASSROOMS[i] }, data: { order: i + 1 } });
  }

  console.log(`Done ✓  active year ${ACTIVE_YEAR}; added ${semesters} semesters, ${rounds} rounds,`);
  console.log(`        ${subjectGroups} subject groups, ${classrooms} classrooms (${CLASSROOMS.length} total defined), removed ${removed} placeholder rooms.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
