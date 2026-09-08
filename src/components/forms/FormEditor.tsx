"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton, SecondaryButton, inputClass } from "@/components/ui";
import {
  addDomain,
  renameDomain,
  deleteDomain,
  addItem,
  renameItem,
  deleteItem,
} from "@/lib/actions/forms";

type Item = { id: string; name: string; order: number };
type Domain = { id: string; name: string; order: number; items: Item[] };

export default function FormEditor({ formId, domains }: { formId: string; domains: Domain[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newDomain, setNewDomain] = useState("");
  const run = (fn: () => Promise<unknown>) => startTransition(async () => {
    await fn();
    router.refresh();
  });

  return (
    <div className="space-y-4">
      {domains.map((d) => (
        <div key={d.id} className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="domain-header px-4 py-3 flex items-center gap-2">
            <input
              defaultValue={d.name}
              onBlur={(e) => e.target.value.trim() && e.target.value !== d.name && run(() => renameDomain(d.id, e.target.value))}
              className="flex-1 bg-white/15 rounded-lg px-3 py-1.5 text-sm font-semibold text-white placeholder-white/60 focus:outline-none"
            />
            <button
              onClick={() => confirm(`ลบ "${d.name}" และรายการทั้งหมด?`) && run(() => deleteDomain(d.id))}
              className="text-white/80 hover:text-white text-sm px-2"
              title="ลบด้าน"
            >
              🗑
            </button>
          </div>
          <div className="p-4 space-y-2">
            {d.items.map((it, i) => (
              <div key={it.id} className="flex items-center gap-2">
                <span className="text-text-muted text-sm w-6 text-right">{i + 1}.</span>
                <input
                  defaultValue={it.name}
                  onBlur={(e) =>
                    e.target.value.trim() && e.target.value !== it.name && run(() => renameItem(it.id, e.target.value))
                  }
                  className={inputClass}
                />
                <button
                  onClick={() => run(() => deleteItem(it.id))}
                  className="text-bad/70 hover:text-bad px-2 shrink-0"
                  title="ลบรายการ"
                >
                  ✕
                </button>
              </div>
            ))}
            <AddRow
              placeholder="เพิ่มรายการประเมิน..."
              onAdd={(v) => run(() => addItem(d.id, v))}
              disabled={pending}
            />
          </div>
        </div>
      ))}

      <div className="bg-surface rounded-xl border border-dashed border-border p-4 flex gap-2">
        <input
          className={inputClass}
          placeholder="ชื่อด้านใหม่ เช่น ด้านที่ 4: ..."
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
        />
        <PrimaryButton
          disabled={pending || !newDomain.trim()}
          onClick={() => {
            run(() => addDomain(formId, newDomain));
            setNewDomain("");
          }}
        >
          เพิ่มด้าน
        </PrimaryButton>
      </div>
    </div>
  );
}

function AddRow({
  placeholder,
  onAdd,
  disabled,
}: {
  placeholder: string;
  onAdd: (v: string) => void;
  disabled?: boolean;
}) {
  const [v, setV] = useState("");
  return (
    <div className="flex items-center gap-2 pl-8">
      <input
        className={inputClass}
        placeholder={placeholder}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) {
            onAdd(v);
            setV("");
          }
        }}
      />
      <SecondaryButton
        disabled={disabled || !v.trim()}
        onClick={() => {
          onAdd(v);
          setV("");
        }}
      >
        ＋
      </SecondaryButton>
    </div>
  );
}
