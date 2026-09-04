import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { computeScores } from "../src/lib/rubric";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  await prisma.evidence.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.observation.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: { email: "admin@school.ac.th", name: "ผู้ดูแลระบบ", role: "ADMIN", position: "ผู้ดูแลระบบ" },
  });
  const director = await prisma.user.create({
    data: {
      email: "director@school.ac.th",
      name: "ผอ.สมชาย ใจดี",
      role: "EXECUTIVE",
      position: "ผู้อำนวยการโรงเรียน",
    },
  });

  const [t1, t2, t3, t4, t5] = await Promise.all([
    prisma.user.create({
      data: { email: "teacher1@school.ac.th", name: "ครูสมหญิง รักเรียน", role: "TEACHER", subjectGroup: "คณิตศาสตร์" },
    }),
    prisma.user.create({
      data: { email: "teacher2@school.ac.th", name: "ครูวิชัย ตั้งใจสอน", role: "TEACHER", subjectGroup: "ภาษาไทย" },
    }),
    prisma.user.create({
      data: { email: "teacher3@school.ac.th", name: "ครูปราณี ขยันดี", role: "TEACHER", subjectGroup: "วิทยาศาสตร์" },
    }),
    prisma.user.create({
      data: { email: "teacher4@school.ac.th", name: "ครูอนุชา มุ่งมั่น", role: "TEACHER", subjectGroup: "ภาษาอังกฤษ" },
    }),
    prisma.user.create({
      data: { email: "teacher5@school.ac.th", name: "ครูสุดา พัฒนาการ", role: "TEACHER", subjectGroup: "สังคมศึกษา" },
    }),
  ]);

  const donePlan1 = await prisma.plan.create({
    data: {
      semester: "1", academicYear: "2568", date: daysAgo(20), time: "09:00",
      subjectGroup: t1.subjectGroup, topic: "การแก้โจทย์ปัญหาสมการเชิงเส้น",
      status: "DONE", supervisorId: director.id, teacherId: t1.id,
    },
  });
  const donePlan2 = await prisma.plan.create({
    data: {
      semester: "1", academicYear: "2568", date: daysAgo(12), time: "10:30",
      subjectGroup: t2.subjectGroup, topic: "การอ่านจับใจความ",
      status: "DONE", supervisorId: admin.id, teacherId: t2.id,
    },
  });
  const donePlan3 = await prisma.plan.create({
    data: {
      semester: "1", academicYear: "2568", date: daysAgo(5), time: "13:00",
      subjectGroup: t3.subjectGroup, topic: "การทดลองทางวิทยาศาสตร์เบื้องต้น",
      status: "DONE", supervisorId: director.id, teacherId: t3.id,
    },
  });
  await prisma.plan.create({
    data: {
      semester: "1", academicYear: "2568", date: daysFromNow(3), time: "09:00",
      subjectGroup: t4.subjectGroup, topic: "Speaking Skills Practice",
      status: "SCHEDULED", supervisorId: director.id, teacherId: t4.id,
    },
  });
  await prisma.plan.create({
    data: {
      semester: "1", academicYear: "2568", date: daysFromNow(9), time: "11:00",
      subjectGroup: t5.subjectGroup, topic: "ประวัติศาสตร์ไทยสมัยรัตนโกสินทร์",
      status: "SCHEDULED", supervisorId: admin.id, teacherId: t5.id,
    },
  });

  const highScores = { prep: [5, 5, 4], activity: [5, 4, 5], media: [4, 5, 4], assess: [5, 4, 5], classroom: [5, 5, 5] };
  const midScores = { prep: [4, 3, 4], activity: [4, 4, 3], media: [3, 3, 4], assess: [4, 3, 3], classroom: [4, 4, 4] };
  const lowScores = { prep: [3, 2, 3], activity: [2, 3, 2], media: [2, 2, 3], assess: [3, 2, 2], classroom: [3, 3, 2] };

  const obs1 = await buildObservation(donePlan1.id, t1.id, director.id, daysAgo(20), "คณิตศาสตร์", "ม.2/1", "คณิตศาสตร์", highScores);
  const obs2 = await buildObservation(donePlan2.id, t2.id, admin.id, daysAgo(12), "ภาษาไทย", "ป.6/2", "ภาษาไทย", midScores);
  const obs3 = await buildObservation(donePlan3.id, t3.id, director.id, daysAgo(5), "วิทยาศาสตร์", "ม.1/3", "วิทยาศาสตร์", lowScores);

  await prisma.feedback.create({
    data: {
      observationId: obs1.id,
      strengths: "เตรียมการสอนดีมาก ใช้สื่อเทคโนโลยีได้อย่างมีประสิทธิภาพ นักเรียนมีส่วนร่วมสูง",
      improvements: "อาจเพิ่มกิจกรรมกลุ่มย่อยให้หลากหลายขึ้น",
      suggestions: "ลองใช้เทคนิค Think-Pair-Share ในชั่วโมงถัดไป",
      teacherResponse: "ได้นำเทคนิค Think-Pair-Share ไปใช้ในสัปดาห์ถัดมาแล้ว นักเรียนตอบสนองดีขึ้น",
      status: "DONE",
    },
  });
  await prisma.feedback.create({
    data: {
      observationId: obs2.id,
      strengths: "การจัดกิจกรรมการอ่านเหมาะสมกับวัยผู้เรียน",
      improvements: "ควรเพิ่มการประเมินระหว่างเรียนให้บ่อยขึ้น",
      suggestions: "จัดทำแบบสังเกตพฤติกรรมการอ่านรายบุคคล",
      teacherResponse: "กำลังจัดทำแบบสังเกตพฤติกรรมการอ่าน คาดว่าจะใช้ได้ในสัปดาห์หน้า",
      status: "IN_PROGRESS",
    },
  });
  await prisma.feedback.create({
    data: {
      observationId: obs3.id,
      strengths: "มีความตั้งใจในการเตรียมอุปกรณ์ทดลอง",
      improvements: "การบริหารเวลาในชั้นเรียนยังไม่คงที่ ควรวางแผนเวลาแต่ละกิจกรรมให้ชัดเจน",
      suggestions: "ลองใช้ตัวจับเวลาแสดงบนหน้าจอระหว่างทำกิจกรรม",
      status: "PENDING",
    },
  });

  await prisma.evidence.create({
    data: {
      uploaderId: t1.id,
      observationId: obs1.id,
      fileName: "บันทึกการใช้เทคนิค-Think-Pair-Share.txt",
      fileType: "text/plain",
      fileData: Buffer.from("บันทึกการนำเทคนิค Think-Pair-Share ไปใช้ในห้องเรียน ม.2/1", "utf-8"),
      description: "หลักฐานการนำข้อเสนอแนะไปพัฒนาการสอน",
    },
  });

  console.log("Seeded:", { admin: admin.email, director: director.email, teachers: [t1, t2, t3, t4, t5].map((t) => t.email) });

  async function buildObservation(
    planId: string,
    teacherId: string,
    supervisorId: string,
    date: Date,
    subjectGroup: string,
    classRoom: string,
    subject: string,
    scores: Record<string, number[]>
  ) {
    const { domainScores, overallScore, level } = computeScores(scores);
    return prisma.observation.create({
      data: {
        planId, date, subjectGroup, classRoom, subject,
        scoresJson: JSON.stringify(scores),
        domainScoresJson: JSON.stringify(domainScores),
        overallScore, level, supervisorId, teacherId,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
