import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_QUALITY_LEVELS } from "../src/lib/scoring";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function sig(name: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='70'><text x='10' y='45' font-size='26' font-family='Segoe Script, Bradley Hand, cursive' font-style='italic' fill='#1e2a28'>${name}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function main() {
  // wipe (order matters for FKs)
  await prisma.evidence.deleteMany();
  await prisma.itemScore.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.committeeMember.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.item.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.assessmentForm.deleteMany();
  await prisma.user.deleteMany();
  await prisma.qualityLevel.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.subjectGroup.deleteMany();
  await prisma.round.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.school.deleteMany();

  await prisma.school.create({
    data: {
      id: "default",
      name: "โรงเรียนเทศบาลวัดกลาง",
      department: "สำนักการศึกษาเทศบาลนครขอนแก่น",
      address: "อำเภอเมืองขอนแก่น จังหวัดขอนแก่น",
    },
  });

  await prisma.qualityLevel.createMany({ data: DEFAULT_QUALITY_LEVELS });

  const y2568 = await prisma.academicYear.create({ data: { year: "2568", active: true } });
  const y2569 = await prisma.academicYear.create({ data: { year: "2569", active: false } });

  const sem1 = await prisma.semester.create({ data: { name: "ภาคเรียนที่ 1", order: 1 } });
  await prisma.semester.create({ data: { name: "ภาคเรียนที่ 2", order: 2 } });

  const round1 = await prisma.round.create({ data: { name: "รอบที่ 1", order: 1 } });
  const round2 = await prisma.round.create({ data: { name: "รอบที่ 2", order: 2 } });

  const classNames = ["ม.1/1", "ม.1/2", "ม.2/1", "ม.2/2", "ม.3/1", "ม.3/2"];
  const classrooms = await Promise.all(
    classNames.map((name, i) => prisma.classroom.create({ data: { name, order: i + 1 } })),
  );

  const sgNames = [
    "คณิตศาสตร์",
    "ภาษาไทย",
    "วิทยาศาสตร์และเทคโนโลยี",
    "ภาษาต่างประเทศ",
    "สังคมศึกษา ศาสนาและวัฒนธรรม",
    "สุขศึกษาและพลศึกษา",
    "ศิลปะ",
    "การงานอาชีพ",
  ];
  const sgs = await Promise.all(sgNames.map((name, i) => prisma.subjectGroup.create({ data: { name, order: i + 1 } })));
  const sg = (n: string) => sgs.find((s) => s.name.startsWith(n))!.id;

  const admin = await prisma.user.create({
    data: { email: "admin@watklang.ac.th", name: "นายสมชาย ใจดี", role: "ADMIN", position: "ผู้ดูแลระบบ", signatureData: sig("S. Jaidee") },
  });
  const wichai = await prisma.user.create({
    data: {
      email: "wichai@watklang.ac.th",
      name: "นายวิชัย เก่งกาจ",
      role: "EXECUTIVE",
      position: "ผู้อำนวยการโรงเรียน",
      signatureData: sig("W. Kengkaj"),
    },
  });
  const prasert = await prisma.user.create({
    data: {
      email: "prasert@watklang.ac.th",
      name: "นายประเสริฐ ขยันดี",
      role: "EXECUTIVE",
      position: "ครูชำนาญการพิเศษ",
      signatureData: sig("P. Khayandee"),
    },
  });

  const malee = await prisma.user.create({
    data: {
      email: "malee@watklang.ac.th",
      name: "นางสาวมาลี รักเรียน",
      role: "TEACHER",
      position: "ครูชำนาญการ",
      subjectGroupId: sg("คณิตศาสตร์"),
      signatureData: sig("Malee R."),
    },
  });
  const suda = await prisma.user.create({
    data: {
      email: "suda@watklang.ac.th",
      name: "นางสาวสุดา ฉลาดเฉลียว",
      role: "TEACHER",
      position: "ครูชำนาญการ",
      subjectGroupId: sg("ภาษาไทย"),
    },
  });
  const supakhen = await prisma.user.create({
    data: {
      email: "supakhen@watklang.ac.th",
      name: "นายศุภเขน ปัญญาภา",
      role: "TEACHER",
      position: "ครู",
      subjectGroupId: sg("วิทยาศาสตร์"),
    },
  });
  const anucha = await prisma.user.create({
    data: {
      email: "anucha@watklang.ac.th",
      name: "นายอนุชา มุ่งมั่น",
      role: "TEACHER",
      position: "ครู",
      subjectGroupId: sg("ภาษาต่างประเทศ"),
    },
  });
  const kanlaya = await prisma.user.create({
    data: {
      email: "kanlaya@watklang.ac.th",
      name: "นางกัลยา ตั้งใจ",
      role: "TEACHER",
      position: "ครู",
      subjectGroupId: sg("สังคมศึกษา"),
    },
  });

  const form = await prisma.assessmentForm.create({ data: { name: "แบบประเมินการนิเทศภายใน", active: true } });

  const domainSpec: [string, string[]][] = [
    [
      "ด้านที่ 1: ด้านการจัดการเรียนการสอน",
      [
        "การวางแผนการจัดการเรียนรู้",
        "การจัดกิจกรรมการเรียนรู้",
        "การใช้สื่อและนวัตกรรม",
        "การวัดและประเมินผลตามสภาพจริง",
        "การใช้คำถามและการสะท้อนคิด",
        "การจัดการเรียนรู้เชิงรุก (Active Learning)",
      ],
    ],
    [
      "ด้านที่ 2: ด้านการบริหารจัดการชั้นเรียน",
      ["การสร้างบรรยากาศการเรียนรู้", "การดูแลช่วยเหลือนักเรียน", "การส่งเสริมวินัยเชิงบวก"],
    ],
    [
      "ด้านที่ 3: ด้านคุณธรรมจริยธรรม",
      ["การเป็นแบบอย่างที่ดี", "ความรับผิดชอบต่อหน้าที่", "การพัฒนาตนเองอย่างต่อเนื่อง"],
    ],
  ];

  const domains: { id: string; items: { id: string }[] }[] = [];
  for (let di = 0; di < domainSpec.length; di++) {
    const [name, items] = domainSpec[di];
    const d = await prisma.domain.create({ data: { formId: form.id, name, order: di + 1 } });
    const createdItems = [];
    for (let ii = 0; ii < items.length; ii++) {
      createdItems.push(await prisma.item.create({ data: { domainId: d.id, name: items[ii], order: ii + 1 } }));
    }
    domains.push({ id: d.id, items: createdItems });
  }

  // helper: create an assignment with a committee and (optionally) their scores
  type Row = { user: { id: string; name: string }; roleLabel: string; scores?: number[][]; notes?: string };
  async function makeAssignment(opts: {
    teacherId: string;
    roundId: string;
    yearId: string;
    classroomId?: string;
    subjectGroupId?: string;
    rows: Row[];
    completed: boolean;
    acknowledgedBy?: string | null;
  }) {
    const a = await prisma.assignment.create({
      data: {
        teacherId: opts.teacherId,
        formId: form.id,
        academicYearId: opts.yearId,
        semesterId: sem1.id,
        roundId: opts.roundId,
        classroomId: opts.classroomId,
        subjectGroupId: opts.subjectGroupId,
        status: opts.completed ? "COMPLETED" : "PENDING",
        acknowledgedAt: opts.acknowledgedBy ? new Date("2026-08-30T09:00:00+07:00") : null,
        teacherSignatureData: opts.acknowledgedBy ? sig(opts.acknowledgedBy) : null,
      },
    });

    let order = 0;
    for (const row of opts.rows) {
      order++;
      const seat = await prisma.committeeMember.create({
        data: { assignmentId: a.id, userId: row.user.id, roleLabel: row.roleLabel, order },
      });
      if (row.scores) {
        const ev = await prisma.evaluation.create({
          data: {
            committeeMemberId: seat.id,
            submittedAt: new Date("2026-08-28T10:00:00+07:00"),
            signatureData: sig(row.user.name),
            strengths: row.notes
              ? `จุดเด่น: ${row.notes}`
              : "เตรียมการสอนเป็นระบบ ใช้สื่อได้เหมาะสม ผู้เรียนมีส่วนร่วมตลอดคาบ",
            improvements: "ควรเพิ่มการประเมินระหว่างเรียนที่หลากหลาย และเปิดโอกาสให้ผู้เรียนสะท้อนคิดมากขึ้น",
            suggestions: "นำเทคนิคการตั้งคำถามปลายเปิดและการเรียนรู้แบบร่วมมือมาใช้ในคาบต่อไป",
          },
        });
        const data: { evaluationId: string; itemId: string; score: number }[] = [];
        row.scores.forEach((domScores, di) => {
          domScores.forEach((score, ii) => {
            data.push({ evaluationId: ev.id, itemId: domains[di].items[ii].id, score });
          });
        });
        await prisma.itemScore.createMany({ data });
      }
    }
    return a;
  }

  // มาลี — reproduces the summary screenshots exactly
  await makeAssignment({
    teacherId: malee.id,
    roundId: round1.id,
    yearId: y2568.id,
    classroomId: classrooms[0].id,
    subjectGroupId: sg("คณิตศาสตร์"),
    completed: true,
    acknowledgedBy: "Malee R.",
    rows: [
      { user: wichai, roleLabel: "ประธานกรรมการ", scores: [[5, 4, 5], [4, 5], [4, 4]] },
      { user: prasert, roleLabel: "กรรมการ", scores: [[5, 4, 5], [4, 4], [5, 4]] },
      { user: malee, roleLabel: "กรรมการและเลขานุการ", scores: [[3, 2, 2], [2, 2], [2, 3]] },
    ],
  });

  // สุดา — overall 3.50 (ดี)
  await makeAssignment({
    teacherId: suda.id,
    roundId: round1.id,
    yearId: y2568.id,
    classroomId: classrooms[2].id,
    subjectGroupId: sg("ภาษาไทย"),
    completed: true,
    acknowledgedBy: "Suda C.",
    rows: [
      { user: wichai, roleLabel: "ประธานกรรมการ", scores: [[3, 3, 3, 3, 3, 3], [3, 3, 3], [3, 3, 3]] },
      { user: prasert, roleLabel: "กรรมการ", scores: [[4, 4, 4, 4, 4, 4], [4, 4, 4], [4, 4, 4]] },
    ],
  });

  // ศุภเขน — overall 4.33 (ดีมาก)
  await makeAssignment({
    teacherId: supakhen.id,
    roundId: round1.id,
    yearId: y2568.id,
    classroomId: classrooms[4].id,
    subjectGroupId: sg("วิทยาศาสตร์"),
    completed: true,
    acknowledgedBy: null,
    rows: [
      { user: wichai, roleLabel: "ประธานกรรมการ", scores: [[5, 5, 5, 5, 5, 5], [5, 5, 5], [5, 5, 5]] },
      { user: prasert, roleLabel: "กรรมการ", scores: [[4, 4, 4, 4, 4, 4], [4, 4, 4], [4, 4, 4]] },
      { user: supakhen, roleLabel: "กรรมการและเลขานุการ", scores: [[4, 4, 4, 4, 4, 4], [4, 4, 4], [4, 4, 4]] },
    ],
  });

  // อนุชา, กัลยา — assigned committee but not yet evaluated (PENDING)
  await makeAssignment({
    teacherId: anucha.id,
    roundId: round1.id,
    yearId: y2568.id,
    classroomId: classrooms[1].id,
    subjectGroupId: sg("ภาษาต่างประเทศ"),
    completed: false,
    rows: [
      { user: wichai, roleLabel: "ประธานกรรมการ" },
      { user: prasert, roleLabel: "กรรมการ" },
    ],
  });
  await makeAssignment({
    teacherId: kanlaya.id,
    roundId: round1.id,
    yearId: y2568.id,
    classroomId: classrooms[3].id,
    subjectGroupId: sg("สังคมศึกษา"),
    completed: false,
    rows: [
      { user: wichai, roleLabel: "ประธานกรรมการ" },
      { user: prasert, roleLabel: "กรรมการ" },
    ],
  });

  // มาลี รอบที่ 2 / 2569 — no committee yet (shows "รอการประเมิน")
  await prisma.assignment.create({
    data: {
      teacherId: malee.id,
      formId: form.id,
      academicYearId: y2569.id,
      semesterId: sem1.id,
      roundId: round2.id,
      classroomId: classrooms[0].id,
      subjectGroupId: sg("คณิตศาสตร์"),
      status: "PENDING",
    },
  });

  console.log("Seeded ✓  admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
