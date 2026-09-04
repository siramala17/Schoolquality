/**
 * All functions here are the client-facing API, invoked from the browser
 * via google.script.run. Each one re-checks the caller's role/ownership
 * server-side — the client-side role gating is UX only, not security.
 */

// ---------- LOOKUPS ----------
function apiGetRubric() { return RUBRIC; }
function apiGetLevels() { return LEVELS; }
function apiGetRoles() { return ROLES; }

function apiGetTeachers() {
  return sheetToObjects_(usersSheet_())
    .filter(u => u.Role === ROLES.TEACHER && u.Active !== false)
    .map(u => ({ email: u.Email, name: u.Name, subjectGroup: u.SubjectGroup }));
}

function apiGetSubjectGroups() {
  const users = sheetToObjects_(usersSheet_());
  return Array.from(new Set(users.map(u => u.SubjectGroup).filter(Boolean)));
}

// ---------- DASHBOARD ----------
function apiGetDashboard() {
  const user = getCurrentUserInfo();
  const plans = sheetToObjects_(plansSheet_());
  const obs = sheetToObjects_(observationsSheet_());
  const teachers = sheetToObjects_(usersSheet_()).filter(u => u.Role === ROLES.TEACHER && u.Active !== false);

  const observedTeacherEmails = new Set(obs.map(o => o.TeacherEmail));
  const totalTeachers = teachers.length;
  const observedCount = teachers.filter(t => observedTeacherEmails.has(t.Email)).length;
  const avgScore = obs.length ? obs.reduce((s, o) => s + Number(o.OverallScore || 0), 0) / obs.length : 0;

  const monthly = {};
  obs.forEach(o => {
    const d = new Date(o.Date);
    if (isNaN(d)) return;
    const key = Utilities.formatDate(d, 'Asia/Bangkok', 'yyyy-MM');
    monthly[key] = (monthly[key] || 0) + 1;
  });

  const levelDist = {};
  LEVELS.forEach(l => levelDist[l.label] = 0);
  obs.forEach(o => { if (levelDist[o.Level] !== undefined) levelDist[o.Level]++; });

  const feedback = sheetToObjects_(feedbackSheet_());
  const followUp = { 'รอติดตาม': 0, 'อยู่ระหว่างพัฒนา': 0, 'เสร็จสิ้น': 0 };
  feedback.forEach(f => { if (followUp[f.Status] !== undefined) followUp[f.Status]++; });

  const today = new Date(new Date().toDateString());
  const upcomingPlans = plans
    .filter(p => p.Status === 'กำหนดการ' && new Date(p.Date) >= today)
    .sort((a, b) => new Date(a.Date) - new Date(b.Date))
    .slice(0, 5);

  return {
    user,
    kpi: {
      totalTeachers,
      totalObservations: obs.length,
      observedCount,
      notObservedCount: totalTeachers - observedCount,
      avgScore: Math.round(avgScore * 100) / 100
    },
    monthly, levelDist, followUp, upcomingPlans
  };
}

// ---------- PLANS ----------
function apiGetPlans() {
  const user = getCurrentUserInfo();
  let plans = sheetToObjects_(plansSheet_());
  if (user.role === ROLES.TEACHER) plans = plans.filter(p => p.TeacherEmail === user.email);
  return plans.sort((a, b) => new Date(b.Date) - new Date(a.Date));
}

function apiCreatePlan(data) {
  const user = requireRole_([ROLES.ADMIN, ROLES.EXECUTIVE]);
  const teacher = sheetToObjects_(usersSheet_()).find(u => u.Email === data.teacherEmail);
  const plan = {
    PlanID: generateId_('PLAN'),
    Semester: data.semester,
    AcademicYear: data.academicYear,
    Date: data.date,
    Time: data.time,
    SupervisorEmail: user.email,
    SupervisorName: user.name,
    TeacherEmail: data.teacherEmail,
    TeacherName: teacher ? teacher.Name : data.teacherEmail,
    SubjectGroup: data.subjectGroup,
    Topic: data.topic,
    Status: 'กำหนดการ',
    CreatedAt: new Date()
  };
  appendRowFromObject_(plansSheet_(), plan);
  return plan;
}

function apiUpdatePlanStatus(planId, status) {
  requireRole_([ROLES.ADMIN, ROLES.EXECUTIVE]);
  const sheet = plansSheet_();
  const row = findRowIndexById_(sheet, 'PlanID', planId);
  if (row === -1) throw new Error('ไม่พบแผนการนิเทศ');
  updateRowFields_(sheet, row, { Status: status });
  return true;
}

function apiDeletePlan(planId) {
  requireRole_([ROLES.ADMIN, ROLES.EXECUTIVE]);
  const sheet = plansSheet_();
  const row = findRowIndexById_(sheet, 'PlanID', planId);
  if (row > -1) sheet.deleteRow(row);
  return true;
}

// ---------- OBSERVATIONS ----------
function apiSubmitObservation(data) {
  const user = requireRole_([ROLES.ADMIN, ROLES.EXECUTIVE]);
  const teacher = sheetToObjects_(usersSheet_()).find(u => u.Email === data.teacherEmail);

  const domainScores = {};
  let totalSum = 0, totalCount = 0;
  RUBRIC.forEach(domain => {
    const scores = domain.items.map((_, idx) => Number(data.scores[domain.key][idx]) || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    domainScores[domain.key] = Math.round(avg * 100) / 100;
    totalSum += avg;
    totalCount++;
  });
  const overallScore = Math.round((totalSum / totalCount) * 100) / 100;
  const level = getLevelForScore(overallScore).label;

  const obs = {
    ObsID: generateId_('OBS'),
    PlanID: data.planId || '',
    Date: data.date,
    SupervisorEmail: user.email,
    SupervisorName: user.name,
    TeacherEmail: data.teacherEmail,
    TeacherName: teacher ? teacher.Name : data.teacherEmail,
    SubjectGroup: data.subjectGroup,
    ClassRoom: data.classRoom,
    Subject: data.subject,
    ScoresJSON: JSON.stringify(data.scores),
    DomainScoresJSON: JSON.stringify(domainScores),
    OverallScore: overallScore,
    Level: level,
    CreatedAt: new Date()
  };
  appendRowFromObject_(observationsSheet_(), obs);

  if (data.planId) apiUpdatePlanStatus(data.planId, 'เสร็จสิ้น');

  if (data.feedback && (data.feedback.strengths || data.feedback.improvements || data.feedback.suggestions)) {
    apiSaveFeedback({
      obsId: obs.ObsID,
      strengths: data.feedback.strengths,
      improvements: data.feedback.improvements,
      suggestions: data.feedback.suggestions
    });
  }
  return obs;
}

function apiGetObservations(filters) {
  const user = getCurrentUserInfo();
  let obs = sheetToObjects_(observationsSheet_());
  if (user.role === ROLES.TEACHER) obs = obs.filter(o => o.TeacherEmail === user.email);
  filters = filters || {};
  if (filters.teacherEmail) obs = obs.filter(o => o.TeacherEmail === filters.teacherEmail);
  if (filters.subjectGroup) obs = obs.filter(o => o.SubjectGroup === filters.subjectGroup);
  if (filters.dateFrom) obs = obs.filter(o => new Date(o.Date) >= new Date(filters.dateFrom));
  if (filters.dateTo) obs = obs.filter(o => new Date(o.Date) <= new Date(filters.dateTo));
  return obs.sort((a, b) => new Date(b.Date) - new Date(a.Date))
    .map(o => Object.assign({}, o, { DomainScores: JSON.parse(o.DomainScoresJSON || '{}') }));
}

function apiGetObservationDetail(obsId) {
  const user = getCurrentUserInfo();
  const obs = sheetToObjects_(observationsSheet_()).find(o => o.ObsID === obsId);
  if (!obs) throw new Error('ไม่พบข้อมูลการสังเกตการสอน');
  if (user.role === ROLES.TEACHER && obs.TeacherEmail !== user.email) {
    throw new Error('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
  }
  obs.Scores = JSON.parse(obs.ScoresJSON || '{}');
  obs.DomainScores = JSON.parse(obs.DomainScoresJSON || '{}');
  const feedback = sheetToObjects_(feedbackSheet_()).find(f => f.ObsID === obsId) || null;
  const evidence = sheetToObjects_(evidenceSheet_()).filter(e => e.RelatedObsID === obsId);
  return { observation: obs, feedback: feedback, evidence: evidence };
}

// ---------- FEEDBACK / ติดตามผล ----------
function apiSaveFeedback(data) {
  requireRole_([ROLES.ADMIN, ROLES.EXECUTIVE]);
  const sheet = feedbackSheet_();
  const existing = sheetToObjects_(sheet).find(f => f.ObsID === data.obsId);
  const now = new Date();
  if (existing) {
    const row = findRowIndexById_(sheet, 'FeedbackID', existing.FeedbackID);
    updateRowFields_(sheet, row, {
      Strengths: data.strengths, Improvements: data.improvements,
      Suggestions: data.suggestions, UpdatedAt: now
    });
    return existing.FeedbackID;
  }
  const feedback = {
    FeedbackID: generateId_('FB'),
    ObsID: data.obsId,
    Strengths: data.strengths || '',
    Improvements: data.improvements || '',
    Suggestions: data.suggestions || '',
    TeacherResponse: '',
    Status: 'รอติดตาม',
    CreatedAt: now,
    UpdatedAt: now
  };
  appendRowFromObject_(sheet, feedback);
  return feedback.FeedbackID;
}

function apiUpdateTeacherResponse(feedbackId, response, status) {
  const user = getCurrentUserInfo();
  const sheet = feedbackSheet_();
  const row = findRowIndexById_(sheet, 'FeedbackID', feedbackId);
  if (row === -1) throw new Error('ไม่พบข้อมูล');
  updateRowFields_(sheet, row, {
    TeacherResponse: response,
    Status: status || 'อยู่ระหว่างพัฒนา',
    UpdatedAt: new Date()
  });
  return true;
}

// ---------- EVIDENCE / คลังหลักฐาน ----------
function apiUploadEvidence(fileData) {
  const user = getCurrentUserInfo();
  const saved = saveEvidenceFile_(fileData.base64, fileData.fileName, fileData.mimeType);
  const evidence = {
    EvidenceID: generateId_('EVD'),
    UploaderEmail: user.email,
    UploaderName: user.name,
    RelatedObsID: fileData.relatedObsId || '',
    FileID: saved.id,
    FileName: saved.name,
    FileURL: saved.url,
    FileType: fileData.mimeType,
    Description: fileData.description || '',
    UploadedAt: new Date()
  };
  appendRowFromObject_(evidenceSheet_(), evidence);
  return evidence;
}

function apiGetEvidenceList(filters) {
  const user = getCurrentUserInfo();
  let list = sheetToObjects_(evidenceSheet_());
  if (user.role === ROLES.TEACHER) list = list.filter(e => e.UploaderEmail === user.email);
  if (filters && filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    list = list.filter(e =>
      String(e.FileName).toLowerCase().indexOf(kw) > -1 ||
      String(e.Description || '').toLowerCase().indexOf(kw) > -1);
  }
  return list.sort((a, b) => new Date(b.UploadedAt) - new Date(a.UploadedAt));
}

function apiDeleteEvidence(evidenceId) {
  const user = getCurrentUserInfo();
  const sheet = evidenceSheet_();
  const item = sheetToObjects_(sheet).find(e => e.EvidenceID === evidenceId);
  if (!item) return false;
  if (user.role === ROLES.TEACHER && item.UploaderEmail !== user.email) {
    throw new Error('ไม่มีสิทธิ์ลบไฟล์นี้');
  }
  try { DriveApp.getFileById(item.FileID).setTrashed(true); } catch (e) { /* file already gone */ }
  const row = findRowIndexById_(sheet, 'EvidenceID', evidenceId);
  if (row > -1) sheet.deleteRow(row);
  return true;
}

// ---------- REPORTS / รายงานอัตโนมัติ ----------
function apiGenerateReport(filters) {
  requireRole_([ROLES.ADMIN, ROLES.EXECUTIVE]);
  filters = filters || {};
  let obs = sheetToObjects_(observationsSheet_())
    .map(o => Object.assign({}, o, { DomainScores: JSON.parse(o.DomainScoresJSON || '{}') }));

  if (filters.teacherEmail) obs = obs.filter(o => o.TeacherEmail === filters.teacherEmail);
  if (filters.subjectGroup) obs = obs.filter(o => o.SubjectGroup === filters.subjectGroup);
  if (filters.dateFrom) obs = obs.filter(o => new Date(o.Date) >= new Date(filters.dateFrom));
  if (filters.dateTo) obs = obs.filter(o => new Date(o.Date) <= new Date(filters.dateTo));

  const byTeacher = {};
  obs.forEach(o => {
    if (!byTeacher[o.TeacherEmail]) {
      byTeacher[o.TeacherEmail] = { name: o.TeacherName, subjectGroup: o.SubjectGroup, count: 0, totalScore: 0 };
    }
    byTeacher[o.TeacherEmail].count++;
    byTeacher[o.TeacherEmail].totalScore += Number(o.OverallScore);
  });
  Object.keys(byTeacher).forEach(k => {
    byTeacher[k].avgScore = Math.round((byTeacher[k].totalScore / byTeacher[k].count) * 100) / 100;
  });

  return { generatedAt: new Date(), filters, totalObservations: obs.length, byTeacher, observations: obs };
}

function apiExportReportCsv(filters) {
  const report = apiGenerateReport(filters);
  let csv = 'ครู,กลุ่มสาระ,วันที่,วิชา,ห้อง,คะแนนรวม,ระดับคุณภาพ,ผู้นิเทศ\n';
  report.observations.forEach(o => {
    csv += [o.TeacherName, o.SubjectGroup, o.Date, o.Subject, o.ClassRoom, o.OverallScore, o.Level, o.SupervisorName]
      .map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',') + '\n';
  });
  const name = 'รายงานการนิเทศ_' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmm') + '.csv';
  const blob = Utilities.newBlob('﻿' + csv, 'text/csv', name); // BOM so Excel reads Thai as UTF-8
  const file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
  return { url: file.getUrl(), name: file.getName() };
}

function apiExportReportPdf(htmlContent) {
  const blob = Utilities.newBlob(htmlContent, 'text/html', 'report.html').getAs('application/pdf');
  blob.setName('รายงานการนิเทศ_' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmm') + '.pdf');
  const file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
  return { url: file.getUrl(), name: file.getName() };
}

// ---------- ADMIN: จัดการผู้ใช้ ----------
function apiGetAllUsers() {
  requireRole_([ROLES.ADMIN]);
  return sheetToObjects_(usersSheet_());
}

function apiUpsertUser(data) {
  requireRole_([ROLES.ADMIN]);
  const sheet = usersSheet_();
  const row = findRowIndexById_(sheet, 'Email', data.email);
  const fields = {
    Name: data.name, Role: data.role, SubjectGroup: data.subjectGroup,
    Position: data.position, Active: data.active !== false
  };
  if (row > -1) {
    updateRowFields_(sheet, row, fields);
  } else {
    appendRowFromObject_(sheet, Object.assign({ Email: data.email }, fields));
  }
  return true;
}
