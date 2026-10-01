import Link from "next/link";
import { getUsers, getSubjectGroups } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import { ROLE_LABELS, USER_GROUPS, isUserGroup, type UserGroup } from "@/lib/labels";
import CrudManager, { type ColumnDef, type FieldDef } from "@/components/crud/CrudManager";
import { createUser, updateUser, deleteUser } from "@/lib/actions/users";
import type { Role } from "@/generated/prisma/enums";

export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  await requireRole(["ADMIN"]);
  const sp = await searchParams;
  const group: UserGroup = isUserGroup(sp.type) ? sp.type : "admin";
  const { label, icon, roles } = USER_GROUPS[group];

  const [users, subjectGroups] = await Promise.all([getUsers(), getSubjectGroups()]);
  const counts = Object.fromEntries(
    (Object.keys(USER_GROUPS) as UserGroup[]).map((g) => [
      g,
      users.filter((u) => USER_GROUPS[g].roles.includes(u.role)).length,
    ]),
  ) as Record<UserGroup, number>;

  const rows = users
    .filter((u) => roles.includes(u.role))
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      name: u.name,
      role: u.role,
      position: u.position ?? "",
      subjectGroupId: u.subjectGroupId ?? "",
      subjectGroupName: u.subjectGroup?.name ?? "",
      active: u.active,
    }));

  const columns: ColumnDef[] = [
    { key: "name", header: "ชื่อ-นามสกุล" },
    { key: "email", header: "อีเมล", className: "text-text-muted" },
    { key: "role", header: "บทบาท", map: ROLE_LABELS },
    { key: "position", header: "ตำแหน่ง" },
    ...(group === "supervisee" ? [{ key: "subjectGroupName", header: "กลุ่มสาระ" }] : []),
    { key: "active", header: "สถานะ", cell: "bool" },
  ];

  const fields: FieldDef[] = [
    { name: "name", label: "ชื่อ-นามสกุล", required: true },
    {
      name: "email",
      label: "อีเมล (ไม่บังคับ — ต้องมีจึงจะเข้าสู่ระบบได้)",
      type: "email",
      placeholder: "เว้นว่างได้",
    },
    {
      // เปลี่ยนบทบาทได้ทุกแท็บ — เมื่อบันทึก ผู้ใช้จะย้ายไปอยู่ในแท็บของบทบาทใหม่
      name: "role",
      label: "บทบาท",
      type: "select",
      required: true,
      defaultValue: roles[0],
      options: (Object.keys(ROLE_LABELS) as Role[]).map((r) => ({ value: r, label: ROLE_LABELS[r] })),
    },
    {
      name: "position",
      label: "ตำแหน่ง",
      placeholder: group === "supervisor" ? "รองผู้อำนวยการสถานศึกษา" : "ครูชำนาญการ",
    },
    {
      name: "subjectGroupId",
      label: "กลุ่มสาระการเรียนรู้",
      type: "select",
      options: subjectGroups.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: "active", label: "เปิดใช้งานบัญชี", type: "checkbox" },
  ];

  return (
    <div>
      <SectionTitle icon="👥" count={users.length}>
        จัดการผู้ใช้งาน
      </SectionTitle>

      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(USER_GROUPS) as UserGroup[]).map((g) => {
          const active = g === group;
          return (
            <Link
              key={g}
              href={`/users?type=${g}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border ${
                active
                  ? "bg-primary text-white border-primary font-semibold"
                  : "bg-surface text-text-muted border-border hover:bg-primary/5"
              }`}
            >
              <span>{USER_GROUPS[g].icon}</span>
              <span>{USER_GROUPS[g].label}</span>
              <span className={`text-xs rounded-full px-2 ${active ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                {counts[g]}
              </span>
            </Link>
          );
        })}
      </div>

      <CrudManager
        key={group}
        rows={rows}
        addLabel={`ลงทะเบียน${label}`}
        emptyText={`${icon} ยังไม่มีข้อมูล${label}`}
        columns={columns}
        fields={fields}
        actions={{
          create: createUser.bind(null, group),
          update: updateUser.bind(null, group),
          remove: deleteUser,
        }}
      />
    </div>
  );
}
