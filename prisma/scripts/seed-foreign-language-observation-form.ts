// Adds the real "แบบสังเกตชั้นเรียน (Classroom Observation) ครูผู้สอนภาษาต่างประเทศ"
// form (6 domains, 39 items, 1-4 scale) from the school's official document.
// Run against your own DATABASE_URL:
//   npx tsx prisma/scripts/seed-foreign-language-observation-form.ts
//
// Safe to re-run: it upserts by form/domain/item name instead of wiping data.
// It also replaces the QualityLevel rows to match the 1-4 scale (ปรับปรุง/พอใช้/ดี/ดีมาก) —
// back up first if you rely on a different scale.

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_QUALITY_LEVELS } from "../../src/lib/scoring";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const FORM_NAME = "แบบสังเกตชั้นเรียน (Classroom Observation) ครูผู้สอนภาษาต่างประเทศ";

const DOMAINS: { name: string; items: string[] }[] = [
  {
    name: "ด้านผู้สอน",
    items: [
      "มีบุคลิกภาพยิ้มแย้มแจ่มใส",
      "เอาใจใส่เด็กรายบุคคลอย่างทั่วถึง",
      "มีปฏิสัมพันธ์และมีเมตตาต่อเด็กทุกคน",
      "แนะนำแนวการสอน การวัดและประเมินผลแก่ผู้เรียน",
      "การเตรียมความพร้อม เตรียมการสอน และความตรงต่อเวลา",
      "ความสามารถในการจัดการชั้นเรียนและแก้ปัญหาในชั้นเรียน",
    ],
  },
  {
    name: "ด้านเนื้อหา",
    items: [
      "บอกเรื่องและแนวคิดสำคัญ หรือนิยามศัพท์ ของเรื่องที่สอนได้ชัดเจน",
      "เนื้อหาที่สอนมีความน่าสนใจ ทันสมัย",
      "ความครอบคลุมและสอดคล้องกับวัตถุประสงค์",
      "ความเหมาะสมกับระดับความรู้ ความสามารถของผู้เรียน",
      "การนำไปประยุกต์ใช้ในสถานการณ์อื่น ๆ หรือวิชาอื่น ๆ",
      "การสอดแทรกคุณธรรม จริยธรรม และแนวคิดตามหลักของปรัชญาเศรษฐกิจพอเพียงแก่ผู้เรียนในเนื้อหา",
    ],
  },
  {
    name: "ด้านกิจกรรมการเรียนการสอน",
    items: [
      "มีแผนการจัดการเรียนรู้ มีสื่อ อุปกรณ์ เครื่องมือวัดและประเมินผล/สอดคล้องกับกิจกรรมการเรียนรู้",
      "ผู้เรียนทุกคนมีส่วนร่วมในชั้นเรียน",
      "ส่งเสริมให้ผู้เรียนศึกษาค้นคว้าด้วยตนเอง พร้อมแนะนำแหล่งความรู้เพิ่มเติม",
      "พัฒนาผู้เรียนให้เกิดแนวคิดเชิงวิเคราะห์ สังเคราะห์ และสร้างสรรค์",
      "มีกิจกรรมการเรียนการสอนโดยเน้นผู้เรียนเป็นสำคัญ",
      "ผู้เรียนมีการโต้ตอบสื่อสารกับครูถึงความเข้าใจในเนื้อหา หรือแนวคิดสำคัญ",
      "ครูใช้คำถามให้ผู้เรียนเชื่อมโยง ประยุกต์ใช้แนวความคิดหลักเพื่อแก้ปัญหา และให้เหตุผลในการใช้กลวิธีและตอบคำถามนั้น",
      "ครูใช้คำถามให้ผู้เรียนประยุกต์ใช้เรื่องที่เรียนเข้ากับเรื่องอื่น ๆ ได้",
      "ครูให้ความสำคัญและตอบสนองต่อคำถามของผู้เรียน",
      "ครูเปิดโอกาสให้ผู้เรียนได้ลองหารูปแบบอื่น ๆ ในการเรียนรู้ หรือหาคำตอบ",
      "รูปแบบการสอนและกิจกรรมที่หลากหลายในเชิงบูรณาการ",
    ],
  },
  {
    name: "ด้านสื่อและสิ่งสนับสนุนการเรียนการสอน",
    items: [
      "มีเอกสารและสื่อประกอบในการเรียนรู้",
      "มีการใช้สื่อที่หลากหลายรูปแบบมาใช้ในการเรียนการสอน (สื่อสิ่งพิมพ์ และสื่ออิเล็กทรอนิกส์)",
      "สื่อที่ใช้สามารถเชื่อมโยงกับเนื้อหาที่สอนให้ผู้เรียนเกิดการเรียนรู้ได้ดีขึ้น",
      "มีการนำเทคโนโลยีสมัยใหม่เข้ามาใช้ในการเรียนการสอน",
    ],
  },
  {
    name: "ด้านการวัดและประเมินผลการเรียน",
    items: [
      "วิธีการวัดผลสอดคล้องและเหมาะสมกับเนื้อหา",
      "วิธีการวัดผลมีความหลากหลาย",
      "ใช้วิธีการประเมินตามสภาพจริง",
      "เกณฑ์การประเมินผลมีความเที่ยงธรรม โปร่งใส",
    ],
  },
  {
    name: "ด้านผู้เรียน",
    items: [
      "การมีส่วนร่วมในชั้นเรียน/ผู้เรียนกล้าแสดงออก",
      "มีความกระตือรือร้น/สนใจเรียนและสนใจศึกษาหาความรู้เพิ่มเติม",
      "มีการสร้างคำอธิบายในกระบวนการเรียนรู้และข้อมูลของผู้เรียนด้วยตนเอง",
      "ได้ใช้ทักษะการคิดขั้นสูง หรือมีผลงานที่เกิดจากทักษะการคิดขั้นสูง",
      "มีการทำงานเป็นกลุ่มหรือทีม",
      "มีการนำเสนอผลงานรายบุคคล/รายกลุ่ม",
      "การนำความรู้ที่ได้รับไปประยุกต์ใช้ หรือการเชื่อมโยงกับชีวิตประจำวัน",
      "มีระเบียบวินัย สุภาพ อ่อนน้อม",
    ],
  },
];

async function main() {
  let form = await prisma.assessmentForm.findFirst({ where: { name: FORM_NAME } });
  if (!form) {
    form = await prisma.assessmentForm.create({ data: { name: FORM_NAME, active: true } });
    console.log("Created form:", form.name);
  } else {
    console.log("Form already exists, updating its domains/items:", form.name);
  }

  for (let di = 0; di < DOMAINS.length; di++) {
    const spec = DOMAINS[di];
    let domain = await prisma.domain.findFirst({ where: { formId: form.id, name: spec.name } });
    if (!domain) {
      domain = await prisma.domain.create({ data: { formId: form.id, name: spec.name, order: di + 1 } });
    } else {
      await prisma.domain.update({ where: { id: domain.id }, data: { order: di + 1 } });
    }

    for (let ii = 0; ii < spec.items.length; ii++) {
      const itemName = spec.items[ii];
      const existing = await prisma.item.findFirst({ where: { domainId: domain.id, name: itemName } });
      if (existing) {
        await prisma.item.update({ where: { id: existing.id }, data: { order: ii + 1 } });
      } else {
        await prisma.item.create({ data: { domainId: domain.id, name: itemName, order: ii + 1 } });
      }
    }
  }

  // Replace quality levels with the 1-4 bands (ปรับปรุง/พอใช้/ดี/ดีมาก) to match this form's scale.
  await prisma.qualityLevel.deleteMany();
  await prisma.qualityLevel.createMany({ data: DEFAULT_QUALITY_LEVELS });

  const totalItems = DOMAINS.reduce((n, d) => n + d.items.length, 0);
  console.log(`Done ✓  ${DOMAINS.length} domains, ${totalItems} items, quality levels reset to 1-4 scale.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
