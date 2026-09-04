"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ROLE_LABELS } from "@/lib/labels";
import { doSignOut } from "@/lib/actions/auth";
import type { Role } from "@/generated/prisma/enums";

type NavItem = { href: string; label: string; icon: string; roles: Role[] };

const NAV_CONFIG: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", roles: ["ADMIN", "EXECUTIVE", "TEACHER"] },
  { href: "/plans", label: "แผนการนิเทศ", icon: "🗓️", roles: ["ADMIN", "EXECUTIVE", "TEACHER"] },
  { href: "/observation", label: "สังเกตการสอน", icon: "📝", roles: ["ADMIN", "EXECUTIVE"] },
  { href: "/feedback", label: "ติดตามผล", icon: "💬", roles: ["ADMIN", "EXECUTIVE", "TEACHER"] },
  { href: "/evidence", label: "คลังหลักฐาน", icon: "📁", roles: ["ADMIN", "EXECUTIVE", "TEACHER"] },
  { href: "/reports", label: "รายงาน", icon: "📄", roles: ["ADMIN", "EXECUTIVE"] },
  { href: "/users", label: "จัดการผู้ใช้", icon: "👤", roles: ["ADMIN"] },
];

type ShellUser = { name?: string | null; email?: string | null; role: Role; subjectGroup?: string | null };

export default function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV_CONFIG.filter((n) => n.roles.includes(user.role));
  const current = NAV_CONFIG.find((n) => pathname.startsWith(n.href));

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
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-gradient-to-b from-primary-dark to-primary text-white flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center gap-2.5 px-4.5 py-5">
          <div className="text-2xl">🎯</div>
          <div>
            <div className="font-bold text-sm tracking-wide">SMART SUPERVISION</div>
            <div className="text-xs opacity-80">360°</div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {items.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm ${
                  active ? "bg-white/20 font-semibold" : "text-white/85 hover:bg-white/10"
                }`}
              >
                <span className="w-5 text-center">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3.5 border-t border-white/15 text-xs">
          <div className="font-semibold">{user.name || user.email}</div>
          <div className="opacity-80">
            {ROLE_LABELS[user.role]}
            {user.subjectGroup ? ` · ${user.subjectGroup}` : ""}
          </div>
          <form action={doSignOut} className="mt-2">
            <button className="text-white/80 hover:text-white underline">ออกจากระบบ</button>
          </form>
        </div>
      </aside>

      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3.5 bg-surface border-b border-border no-print">
          <button className="md:hidden text-xl leading-none" onClick={() => setOpen((o) => !o)} aria-label="menu">
            ☰
          </button>
          <div className="font-bold text-lg">{current?.label ?? ""}</div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-5 pb-16 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
