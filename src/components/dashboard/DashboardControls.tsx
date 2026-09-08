"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { inputClass } from "@/components/ui";

type Opt = { id: string; name: string };

export function FilterBar({
  rounds,
  semesters,
  years,
}: {
  rounds: Opt[];
  semesters: Opt[];
  years: Opt[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="text-primary">▾</span> ตัวกรองข้อมูลสรุปการนิเทศ
      </h3>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-text-muted">รอบที่</span>
          <select className={inputClass} value={sp.get("round") ?? ""} onChange={(e) => set("round", e.target.value)}>
            <option value="">-- ทุกรอบ --</option>
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-text-muted">ภาคเรียน</span>
          <select
            className={inputClass}
            value={sp.get("semester") ?? ""}
            onChange={(e) => set("semester", e.target.value)}
          >
            <option value="">-- ทุกภาคเรียน --</option>
            {semesters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-text-muted">ปีการศึกษา</span>
          <select className={inputClass} value={sp.get("year") ?? ""} onChange={(e) => set("year", e.target.value)}>
            <option value="">-- ทุกปีการศึกษา --</option>
            {years.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export function TeacherPicker({ teachers }: { teachers: Opt[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = teachers.find((t) => t.id === sp.get("teacher"));

  function load(formData: FormData) {
    const name = String(formData.get("teacher") || "").trim();
    const match = teachers.find((t) => t.name === name);
    const next = new URLSearchParams(sp.toString());
    if (match) next.set("teacher", match.id);
    else next.delete("teacher");
    router.push(`${pathname}?${next.toString()}`);
  }

  function clear() {
    const next = new URLSearchParams(sp.toString());
    next.delete("teacher");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <form action={load} className="bg-surface rounded-xl shadow-sm border border-border p-4">
      <h3 className="text-sm font-semibold mb-1">สรุปการนิเทศรายบุคคล</h3>
      <label className="text-xs text-text-muted">เลือกครูผู้รับการนิเทศ (สามารถพิมพ์ค้นหาได้)</label>
      <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
        <input
          name="teacher"
          list="teacher-options"
          defaultValue={current?.name ?? ""}
          placeholder="พิมพ์ชื่อครู..."
          className={inputClass}
        />
        <datalist id="teacher-options">
          {teachers.map((t) => (
            <option key={t.id} value={t.name} />
          ))}
        </datalist>
        <button type="submit" className="rounded-lg brand-gradient text-white px-4 py-2 text-sm font-semibold shrink-0">
          🔍 โหลดข้อมูล
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-border px-4 py-2 text-sm shrink-0 hover:bg-bg"
        >
          ล้างข้อมูล
        </button>
      </div>
    </form>
  );
}
