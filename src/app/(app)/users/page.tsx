import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllUsers } from "@/lib/data/users";
import { Card } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/labels";
import UserFormButton from "@/components/users/UserFormButton";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await getAllUsers();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <UserFormButton />
      </div>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-text-muted uppercase border-b-2 border-border">
              <th className="px-4 py-2.5">อีเมล</th>
              <th className="px-4 py-2.5">ชื่อ</th>
              <th className="px-4 py-2.5">บทบาท</th>
              <th className="px-4 py-2.5">กลุ่มสาระ</th>
              <th className="px-4 py-2.5">สถานะ</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">{u.email}</td>
                <td className="px-4 py-2.5">{u.name}</td>
                <td className="px-4 py-2.5">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-2.5">{u.subjectGroup || "-"}</td>
                <td className="px-4 py-2.5">{u.active ? "ใช้งาน" : "ปิดใช้งาน"}</td>
                <td className="px-4 py-2.5">
                  <UserFormButton
                    initial={{
                      email: u.email,
                      name: u.name,
                      role: u.role,
                      subjectGroup: u.subjectGroup,
                      position: u.position,
                      active: u.active,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
