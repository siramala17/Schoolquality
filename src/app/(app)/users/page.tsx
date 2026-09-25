import { getUsers, getSubjectGroups } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/labels";
import CrudManager from "@/components/crud/CrudManager";
import { createUser, updateUser, deleteUser } from "@/lib/actions/users";

export default async function UsersPage() {
  await requireRole(["ADMIN"]);
  const [users, subjectGroups] = await Promise.all([getUsers(), getSubjectGroups()]);

  const rows = users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    name: u.name,
    role: u.role,
    position: u.position ?? "",
    subjectGroupId: u.subjectGroupId ?? "",
    subjectGroupName: u.subjectGroup?.name ?? "",
    active: u.active,
  }));

  return (
    <div>
      <SectionTitle icon="👥" count={rows.length}>
        จัดการผู้ใช้งาน
      </SectionTitle>
      <CrudManager
        rows={rows}
        addLabel="เพิ่มผู้ใช้งาน"
        columns={[
          { key: "name", header: "ชื่อ-นามสกุล" },
          { key: "email", header: "อีเมล", className: "text-text-muted" },
          { key: "role", header: "บทบาท", map: ROLE_LABELS },
          { key: "position", header: "ตำแหน่ง" },
          { key: "subjectGroupName", header: "กลุ่มสาระ" },
          { key: "active", header: "สถานะ", cell: "bool" },
        ]}
        fields={[
          { name: "name", label: "ชื่อ-นามสกุล", required: true },
          {
            name: "email",
            label: "อีเมล (ไม่บังคับ — ต้องมีจึงจะเข้าสู่ระบบได้)",
            type: "email",
            placeholder: "เว้นว่างได้",
          },
          {
            name: "role",
            label: "บทบาท",
            type: "select",
            required: true,
            options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
          },
          { name: "position", label: "ตำแหน่ง", placeholder: "ครูชำนาญการ" },
          {
            name: "subjectGroupId",
            label: "กลุ่มสาระการเรียนรู้",
            type: "select",
            options: subjectGroups.map((s) => ({ value: s.id, label: s.name })),
          },
          { name: "active", label: "เปิดใช้งานบัญชี", type: "checkbox" },
        ]}
        actions={{ create: createUser, update: updateUser, remove: deleteUser }}
      />
    </div>
  );
}
