/**
 * Identity + role resolution. The web app is deployed with
 * executeAs: USER_ACCESSING so Session.getActiveUser() reliably returns
 * the signed-in Google Workspace user. The very first person to open the
 * app is auto-provisioned as Admin; everyone after that starts as Teacher
 * until an Admin changes their role in "จัดการผู้ใช้".
 */
function getCurrentUserInfo() {
  const email = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  const sheet = usersSheet_();
  const users = sheetToObjects_(sheet);
  let user = users.find(u => String(u.Email).toLowerCase() === String(email).toLowerCase());

  if (!user) {
    const role = users.length === 0 ? ROLES.ADMIN : ROLES.TEACHER;
    user = {
      Email: email,
      Name: email ? email.split('@')[0] : 'ผู้ใช้งาน',
      Role: role,
      SubjectGroup: '',
      Position: '',
      Active: true
    };
    appendRowFromObject_(sheet, user);
  }

  return {
    email: user.Email,
    name: user.Name,
    role: user.Role,
    subjectGroup: user.SubjectGroup,
    position: user.Position
  };
}

function requireRole_(allowedRoles) {
  const user = getCurrentUserInfo();
  if (allowedRoles.indexOf(user.role) === -1) {
    throw new Error('คุณไม่มีสิทธิ์ทำรายการนี้');
  }
  return user;
}
