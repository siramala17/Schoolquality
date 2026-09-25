// Creates the school's base lookup data on a fresh database: academic years,
// semesters, rounds, subject groups and classrooms (ม.1–ม.6 × Gifted / MEP / ขอบฟ้ากว้าง).
// Run against your own DATABASE_URL:
//   npx tsx prisma/scripts/seed-base-data.ts
//
// Safe to re-run: every row is matched by name and only created when missing —
// it never deletes anything and never creates users.

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
const TRACKS = ["Gifted", "MEP", "ขอบฟ้ากว้าง"];
const CLASSROOMS = [1, 2, 3, 4, 5, 6].flatMap((level) => TRACKS.map((track) => `ม.${level} ${track}`));

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
  const classrooms = await ensureNamed(prisma.classroom, CLASSROOMS);

  console.log(`Done ✓  active year ${ACTIVE_YEAR}; added ${semesters} semesters, ${rounds} rounds,`);
  console.log(`        ${subjectGroups} subject groups, ${classrooms} classrooms (${CLASSROOMS.length} total defined).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
