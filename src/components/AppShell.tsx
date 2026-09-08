"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ROLE_LABELS } from "@/lib/labels";
import { doSignOut } from "@/lib/actions/auth";
import type { Role } from "@/generated/prisma/enums";

type NavItem = { href: string; label: string; icon: string; roles: Role[] };

const NAV_CONFIG: NavItem[] = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: "📊", roles: ["ADMIN", "EXECUTIVE", "TEACHER"] },
  { href: "/school", label: "ข้อมูลโรงเรียน", icon: "🏫", roles: ["ADMIN"] },
  { href: "/quality-levels", label: "เกณฑ์ระดับคุณภาพ", icon: "⭐", roles: ["ADMIN"] },
  { href: "/users", label: "จัดการผู้ใช้งาน", icon: "👥", roles: ["ADMIN"] },
  { href: "/classrooms", label: "จัดการชั้นเรียน", icon: "🚪", roles: ["ADMIN"] },
  { href: "/subject-groups", label: "กลุ่มสาระการเรียนรู้", icon: "📚", roles: ["ADMIN"] },
  { href: "/rounds", label: "จัดการรอบที่", icon: "🔄", roles: ["ADMIN"] },
  { href: "/semesters", label: "จัดการภาคเรียน", icon: "🗓️", roles: ["ADMIN"] },
  { href: "/academic-years", label: "จัดการปีการศึกษา", icon: "📅", roles: ["ADMIN"] },
  { href: "/assessment-forms", label: "จัดการแบบประเมิน", icon: "📋", roles: ["ADMIN"] },
  { href: "/assignments", label: "มอบหมายชุดประเมิน", icon: "🧩", roles: ["ADMIN"] },
  { href: "/committee", label: "แต่งตั้งกรรมการ", icon: "🧑‍⚖️", roles: ["ADMIN"] },
  { href: "/evaluate", label: "แบบประเมินของฉัน", icon: "✍️", roles: ["ADMIN", "EXECUTIVE", "TEACHER"] },
  { href: "/results", label: "ผลการนิเทศทั้งหมด", icon: "📈", roles: ["ADMIN", "EXECUTIVE"] },
  { href: "/summary", label: "สรุปผลการนิเทศ", icon: "🧾", roles: ["ADMIN", "EXECUTIVE"] },
  { href: "/my-supervision", label: "ผลการนิเทศของฉัน", icon: "🎓", roles: ["TEACHER"] },
];

type ShellUser = {
  name?: string | null;
  email?: string | null;
  role: Role;
  position?: string | null;
};

export default function AppShell({
  user,
  schoolName,
  children,
}: {
  user: ShellUser;
  schoolName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV_CONFIG.filter((n) => n.roles.includes(user.role));
  const current = NAV_CONFIG.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));

  return (
    <div className="flex min-h-screen">
      {open && (
        <button
          aria-label="close menu"
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-deep text-white flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-xl shrink-0">🏫</div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">{user.name || user.email}</div>
            <div className="text-xs opacity-75 truncate">{user.position || ROLE_LABELS[user.role]}</div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-0.5 px-2 py-2 overflow-y-auto">
          {items.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                  active ? "bg-white/20 font-semibold" : "text-white/85 hover:bg-white/10"
                }`}
              >
                <span className="w-5 text-center">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-2 py-3 border-t border-white/10">
          <form action={doSignOut}>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/85 hover:bg-white/10">
              <span className="w-5 text-center">🚪</span>
              <span>ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 py-3 bg-surface border-b border-border no-print">
          <button className="md:hidden text-xl leading-none" onClick={() => setOpen((o) => !o)} aria-label="menu">
            ☰
          </button>
          <div className="font-bold text-base sm:text-lg flex-1 truncate">{current?.label ?? "ระบบนิเทศภายในโรงเรียน"}</div>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold">
              {(user.name || "?").trim().charAt(0)}
            </div>
            <span className="text-text-muted">{user.name}</span>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-5 pb-10 max-w-6xl w-full mx-auto">{children}</main>
        <footer className="text-center text-xs text-text-muted py-4 border-t border-border no-print">
          ระบบนิเทศภายในโรงเรียน • {schoolName}
        </footer>
      </div>
    </div>
  );
}
