/**
 * Generic helpers for treating Sheet rows as JS objects, plus one
 * getOrCreate accessor per logical table. Sheets/headers are created
 * lazily on first access, so no manual setup step is required.
 */
function getOrCreateSheet_(name, headers) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function usersSheet_() {
  return getOrCreateSheet_(SHEET_NAMES.USERS,
    ['Email', 'Name', 'Role', 'SubjectGroup', 'Position', 'Active']);
}
function plansSheet_() {
  return getOrCreateSheet_(SHEET_NAMES.PLANS,
    ['PlanID', 'Semester', 'AcademicYear', 'Date', 'Time', 'SupervisorEmail', 'SupervisorName',
      'TeacherEmail', 'TeacherName', 'SubjectGroup', 'Topic', 'Status', 'CreatedAt']);
}
function observationsSheet_() {
  return getOrCreateSheet_(SHEET_NAMES.OBSERVATIONS,
    ['ObsID', 'PlanID', 'Date', 'SupervisorEmail', 'SupervisorName', 'TeacherEmail', 'TeacherName',
      'SubjectGroup', 'ClassRoom', 'Subject', 'ScoresJSON', 'DomainScoresJSON', 'OverallScore',
      'Level', 'CreatedAt']);
}
function feedbackSheet_() {
  return getOrCreateSheet_(SHEET_NAMES.FEEDBACK,
    ['FeedbackID', 'ObsID', 'Strengths', 'Improvements', 'Suggestions', 'TeacherResponse',
      'Status', 'CreatedAt', 'UpdatedAt']);
}
function evidenceSheet_() {
  return getOrCreateSheet_(SHEET_NAMES.EVIDENCE,
    ['EvidenceID', 'UploaderEmail', 'UploaderName', 'RelatedObsID', 'FileID', 'FileName',
      'FileURL', 'FileType', 'Description', 'UploadedAt']);
}
function settingsSheet_() {
  return getOrCreateSheet_(SHEET_NAMES.SETTINGS, ['Key', 'Value']);
}

function sheetToObjects_(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1)
    .filter(r => r.some(c => c !== ''))
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });
}

function appendRowFromObject_(sheet, obj) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(h => obj[h] !== undefined ? obj[h] : ''));
}

function findRowIndexById_(sheet, idHeader, id) {
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf(idHeader);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) return i + 1; // 1-based sheet row
  }
  return -1;
}

function updateRowFields_(sheet, rowIndex, fields) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Object.keys(fields).forEach(key => {
    const col = headers.indexOf(key);
    if (col > -1) sheet.getRange(rowIndex, col + 1).setValue(fields[key]);
  });
}

function generateId_(prefix) {
  return prefix + '-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
}
