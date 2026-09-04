/**
 * Central configuration: sheet layout, roles, and the observation rubric.
 */
const SHEET_NAMES = {
  USERS: 'Users',
  PLANS: 'Plans',
  OBSERVATIONS: 'Observations',
  FEEDBACK: 'Feedback',
  EVIDENCE: 'Evidence',
  SETTINGS: 'Settings'
};

const ROLES = {
  ADMIN: 'ผู้ดูแลระบบ',
  EXECUTIVE: 'ผู้บริหาร',
  TEACHER: 'ครู'
};

// 5 ด้านตามแบบสังเกตการสอน แต่ละด้านมีรายการประเมินย่อย ให้คะแนน 1-5
const RUBRIC = [
  {
    key: 'prep', name: 'การเตรียมการสอน',
    items: [
      'มีแผนการจัดการเรียนรู้ที่ชัดเจน สอดคล้องกับตัวชี้วัด',
      'เตรียมสื่อ ใบงาน และแหล่งเรียนรู้ล่วงหน้า',
      'กำหนดเป้าหมายการเรียนรู้ที่วัดผลได้ชัดเจน'
    ]
  },
  {
    key: 'activity', name: 'การจัดกิจกรรมการเรียนรู้',
    items: [
      'จัดกิจกรรมเน้นผู้เรียนเป็นสำคัญ (Active Learning)',
      'ลำดับขั้นตอนกิจกรรมเหมาะสมกับเวลาและเนื้อหา',
      'ส่งเสริมการคิดวิเคราะห์และการแก้ปัญหา'
    ]
  },
  {
    key: 'media', name: 'การใช้สื่อและเทคโนโลยี',
    items: [
      'เลือกใช้สื่อ/เทคโนโลยีเหมาะสมกับเนื้อหาและผู้เรียน',
      'ใช้สื่อได้อย่างคล่องแคล่วและมีประสิทธิภาพ',
      'ส่งเสริมให้ผู้เรียนใช้เทคโนโลยีเพื่อการเรียนรู้'
    ]
  },
  {
    key: 'assess', name: 'การวัดและประเมินผล',
    items: [
      'มีเครื่องมือวัดผลสอดคล้องกับจุดประสงค์การเรียนรู้',
      'ประเมินผลระหว่างเรียน (Formative Assessment) อย่างต่อเนื่อง',
      'ให้ข้อมูลย้อนกลับ (Feedback) แก่ผู้เรียนอย่างเหมาะสม'
    ]
  },
  {
    key: 'classroom', name: 'การจัดการชั้นเรียน',
    items: [
      'สร้างบรรยากาศที่เอื้อต่อการเรียนรู้',
      'ดูแลพฤติกรรมผู้เรียนอย่างเหมาะสม',
      'บริหารเวลาในชั้นเรียนได้อย่างมีประสิทธิภาพ'
    ]
  }
];

const LEVELS = [
  { min: 4.51, max: 5.00, label: 'ดีเยี่ยม', color: '#2e7d32' },
  { min: 3.51, max: 4.50, label: 'ดีมาก', color: '#558b2f' },
  { min: 2.51, max: 3.50, label: 'ดี', color: '#f9a825' },
  { min: 1.51, max: 2.50, label: 'พอใช้', color: '#ef6c00' },
  { min: 1.00, max: 1.50, label: 'ควรพัฒนา', color: '#c62828' }
];

function getLevelForScore(score) {
  for (const lv of LEVELS) {
    if (score >= lv.min && score <= lv.max) return lv;
  }
  return LEVELS[LEVELS.length - 1];
}

/** The single spreadsheet acting as the database. Created automatically on first run. */
function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SPREADSHEET_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* fall through and recreate */ }
  }
  const ss = SpreadsheetApp.create('SMART SUPERVISION 360 - Database');
  props.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

/** Drive folder used to store uploaded evidence files. Created automatically on first run. */
function getEvidenceFolder() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('EVIDENCE_FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* fall through and recreate */ }
  }
  const folder = DriveApp.createFolder('SMART SUPERVISION 360 - หลักฐาน');
  props.setProperty('EVIDENCE_FOLDER_ID', folder.getId());
  return folder;
}
