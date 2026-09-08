"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton, SecondaryButton, GradientButton, inputClass, EmptyState } from "@/components/ui";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "select" | "checkbox" | "textarea";
  options?: { value: string; label: string }[];
  required?: boolean;
  step?: string;
  placeholder?: string;
  colSpan?: 1 | 2;
};

export type ColumnDef<Row> = {
  key: string;
  header: string;
  render?: (row: Row) => React.ReactNode;
  className?: string;
};

type ActionResult = { error?: string } | void;

export type CrudActions = {
  create: (data: Record<string, unknown>) => Promise<ActionResult>;
  update: (id: string, data: Record<string, unknown>) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
};

export default function CrudManager<Row extends { id: string }>({
  rows,
  columns,
  fields,
  actions,
  addLabel = "เพิ่มรายการ",
  emptyText = "ยังไม่มีข้อมูล",
}: {
  rows: Row[];
  columns: ColumnDef<Row>[];
  fields: FieldDef[];
  actions: CrudActions;
  addLabel?: string;
  emptyText?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setForm(
      Object.fromEntries(
        fields.map((f) => [f.name, f.type === "checkbox" ? true : ""]),
      ),
    );
    setError(null);
    setOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setForm(
      Object.fromEntries(
        fields.map((f) => {
          const v = (row as Record<string, unknown>)[f.name];
          if (f.type === "checkbox") return [f.name, Boolean(v)];
          return [f.name, v == null ? "" : String(v)];
        }),
      ),
    );
    setError(null);
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const data: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = form[f.name];
      if (f.type === "checkbox") data[f.name] = Boolean(raw);
      else if (f.type === "number") data[f.name] = raw === "" ? null : Number(raw);
      else data[f.name] = raw === "" ? null : String(raw).trim();
    }
    startTransition(async () => {
      const res = editing ? await actions.update(editing.id, data) : await actions.create(data);
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function del(row: Row) {
    if (!confirm("ยืนยันการลบรายการนี้?")) return;
    startTransition(async () => {
      const res = await actions.remove(row.id);
      if (res && "error" in res && res.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <GradientButton className="w-full mb-4 py-3" onClick={openCreate}>
        ＋ {addLabel}
      </GradientButton>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/5 text-primary text-left">
                <th className="px-4 py-3 font-semibold w-12">ที่</th>
                {columns.map((c) => (
                  <th key={c.key} className={`px-4 py-3 font-semibold ${c.className ?? ""}`}>
                    {c.header}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 2}>
                    <EmptyState>{emptyText}</EmptyState>
                  </td>
                </tr>
              )}
              {rows.map((row, i) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "-")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center"
                        title="แก้ไข"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => del(row)}
                        className="w-8 h-8 rounded-lg bg-bad/10 text-bad hover:bg-bad/20 flex items-center justify-center"
                        title="ลบ"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg bg-surface rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">{editing ? "แก้ไขรายการ" : addLabel}</h3>
            <form onSubmit={submit}>
              <div className="grid sm:grid-cols-2 gap-x-4">
                {fields.map((f) => (
                  <div key={f.name} className={f.colSpan === 2 || f.type === "textarea" ? "sm:col-span-2" : ""}>
                    {f.type === "checkbox" ? (
                      <label className="flex items-center gap-2 mb-3 mt-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(form[f.name])}
                          onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.checked }))}
                        />
                        {f.label}
                      </label>
                    ) : (
                      <label className="flex flex-col gap-1.5 mb-3">
                        <span className="text-xs font-medium text-text-muted">
                          {f.label}
                          {f.required && <span className="text-bad"> *</span>}
                        </span>
                        {f.type === "select" ? (
                          <select
                            className={inputClass}
                            value={String(form[f.name] ?? "")}
                            required={f.required}
                            onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                          >
                            <option value="">-- เลือก --</option>
                            {f.options?.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : f.type === "textarea" ? (
                          <textarea
                            className={inputClass}
                            rows={3}
                            value={String(form[f.name] ?? "")}
                            required={f.required}
                            placeholder={f.placeholder}
                            onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                          />
                        ) : (
                          <input
                            className={inputClass}
                            type={f.type ?? "text"}
                            step={f.step}
                            value={String(form[f.name] ?? "")}
                            required={f.required}
                            placeholder={f.placeholder}
                            onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                          />
                        )}
                      </label>
                    )}
                  </div>
                ))}
              </div>
              {error && <p className="text-sm text-bad mb-3">{error}</p>}
              <div className="flex gap-2 justify-end mt-2">
                <SecondaryButton type="button" onClick={() => setOpen(false)}>
                  ยกเลิก
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={pending}>
                  {pending ? "กำลังบันทึก..." : "บันทึก"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
