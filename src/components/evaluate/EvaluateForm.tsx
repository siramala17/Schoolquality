"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton, SecondaryButton, Label, inputClass } from "@/components/ui";
import { SCORE_COLORS } from "@/lib/scoring";
import SignaturePad from "@/components/SignaturePad";
import { saveEvaluation, addEvidence, deleteEvidence } from "@/lib/actions/evaluations";

type Item = { id: string; name: string };
type Domain = { id: string; name: string; items: Item[] };
type Evidence = { id: string; fileName: string };

const SCALE = [
  { v: 1, label: "ปรับปรุง" },
  { v: 2, label: "พอใช้" },
  { v: 3, label: "ดี" },
  { v: 4, label: "ดีมาก" },
];

export default function EvaluateForm({
  committeeMemberId,
  teacherName,
  contextLabel,
  domains,
  initial,
  evidence,
  submitted,
}: {
  committeeMemberId: string;
  teacherName: string;
  contextLabel: string;
  domains: Domain[];
  initial: {
    scores: Record<string, number>;
    strengths: string;
    improvements: string;
    suggestions: string;
    signatureData: string | null;
  };
  evidence: Evidence[];
  submitted: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [scores, setScores] = useState<Record<string, number>>(initial.scores);
  const [strengths, setStrengths] = useState(initial.strengths);
  const [improvements, setImprovements] = useState(initial.improvements);
  const [suggestions, setSuggestions] = useState(initial.suggestions);
  const [signature, setSignature] = useState<string | null>(initial.signatureData);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalItems = domains.reduce((n, d) => n + d.items.length, 0);
  const scoredCount = Object.keys(scores).length;

  function setScore(itemId: string, v: number) {
    setScores((s) => ({ ...s, [itemId]: v }));
  }

  function setScoreForItems(itemIds: string[], v: number) {
    setScores((s) => {
      const next = { ...s };
      for (const id of itemIds) next[id] = v;
      return next;
    });
  }

  const allItemIds = domains.flatMap((d) => d.items.map((it) => it.id));

  function save(submit: boolean) {
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await saveEvaluation(committeeMemberId, {
        scores,
        strengths,
        improvements,
        suggestions,
        signatureData: signature,
        submit,
      });
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      setMsg(submit ? "ส่งผลการประเมินเรียบร้อย" : "บันทึกฉบับร่างแล้ว");
      router.refresh();
    });
  }

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError(null);
    startTransition(async () => {
      for (const file of files) {
        const fd = new FormData();
        fd.set("file", file);
        const res = await addEvidence(committeeMemberId, fd);
        if (res && "error" in res && res.error) setError(`${file.name}: ${res.error}`);
      }
      router.refresh();
    });
  }

  function removeEvidence(ev: Evidence) {
    if (!confirm(`ลบรูป "${ev.fileName}" ใช่หรือไม่?`)) return;
    startTransition(async () => {
      const res = await deleteEvidence(ev.id);
      if (res && "error" in res && res.error) setError(res.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-xl shadow-sm border border-border p-4">
        <h2 className="font-bold text-lg">แบบประเมิน — {teacherName}</h2>
        <p className="text-xs text-text-muted">{contextLabel}</p>
        <p className="text-xs mt-2">
          ให้คะแนนแล้ว <span className="font-semibold text-primary">{scoredCount}</span> / {totalItems} รายการ
          {submitted && <span className="ml-2 text-emerald-700">• ส่งผลแล้ว (แก้ไขได้)</span>}
        </p>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-xs text-text-muted mr-1">ให้คะแนนทั้งฟอร์มระดับเดียวกัน:</span>
          {SCALE.map(({ v, label }) => (
            <button
              key={v}
              type="button"
              onClick={() => setScoreForItems(allItemIds, v)}
              title={`ตั้งทุกข้อในฟอร์มเป็น ${label}`}
              className="w-8 h-8 rounded-lg text-xs font-bold border transition-all"
              style={{ borderColor: SCORE_COLORS[v], color: SCORE_COLORS[v], background: "#fff" }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {domains.map((d, di) => (
        <div key={d.id} className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="domain-header px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-sm">{d.name || `ด้านที่ ${di + 1}`}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs opacity-70 mr-0.5">ให้คะแนนทั้งด้าน:</span>
              {SCALE.map(({ v, label }) => {
                const itemIds = d.items.map((it) => it.id);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setScoreForItems(itemIds, v)}
                    title={`ตั้งทุกข้อในด้านนี้เป็น ${label}`}
                    className="w-7 h-7 rounded-lg text-xs font-bold border transition-all"
                    style={{ borderColor: SCORE_COLORS[v], color: SCORE_COLORS[v], background: "#fff" }}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="divide-y divide-dashed divide-border">
            {d.items.map((it, i) => (
              <div key={it.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="text-sm flex-1">
                  {i + 1}. {it.name}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {SCALE.map(({ v }) => {
                    const active = scores[it.id] === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setScore(it.id, v)}
                        title={SCALE[v - 1].label}
                        className="w-9 h-9 rounded-lg text-sm font-bold border transition-all"
                        style={
                          active
                            ? { background: SCORE_COLORS[v], borderColor: SCORE_COLORS[v], color: "#fff" }
                            : { borderColor: "var(--border)", color: "var(--text-muted)", background: "#f8fafc" }
                        }
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-surface rounded-xl shadow-sm border border-border p-4">
        <h3 className="font-semibold text-sm mb-3">ข้อเสนอแนะ</h3>
        <Label text="จุดเด่น">
          <textarea className={inputClass} rows={2} value={strengths} onChange={(e) => setStrengths(e.target.value)} />
        </Label>
        <Label text="จุดที่ควรพัฒนา">
          <textarea
            className={inputClass}
            rows={2}
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
          />
        </Label>
        <Label text="ข้อเสนอแนะเพิ่มเติม">
          <textarea className={inputClass} rows={2} value={suggestions} onChange={(e) => setSuggestions(e.target.value)} />
        </Label>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-4">
        <h3 className="font-semibold text-sm mb-3">รูปภาพประกอบการนิเทศ</h3>
        {evidence.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {evidence.map((ev) => (
              <div key={ev.id} className="flex flex-col items-center gap-2">
                <img
                  src={`/api/evidence/${ev.id}`}
                  alt={ev.fileName}
                  className="w-40 h-40 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => removeEvidence(ev)}
                  className="rounded-lg border border-bad text-bad px-3 py-1 text-xs font-medium hover:bg-bad hover:text-white transition-colors disabled:opacity-50"
                >
                  🗑 ลบรูป
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-text-muted mb-4">ยังไม่มีรูปภาพ</p>
        )}
        <div className="flex justify-center">
          <label
            className={`rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer ${pending ? "opacity-50 pointer-events-none" : ""}`}
          >
            {pending ? "กำลังอัปโหลด..." : "➕ เพิ่มรูปภาพ"}
            <input type="file" accept="image/*" multiple onChange={upload} className="hidden" />
          </label>
        </div>
        <p className="text-center text-xs text-text-muted mt-2">เลือกได้หลายรูปพร้อมกัน ไฟล์ละไม่เกิน 4MB</p>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-4">
        <h3 className="font-semibold text-sm mb-3">ลงลายมือชื่อกรรมการ</h3>
        <SignaturePad value={signature} onChange={setSignature} />
      </div>

      {error && <p className="text-sm text-bad">{error}</p>}
      {msg && <p className="text-sm text-good">{msg}</p>}

      <div className="flex gap-2">
        <SecondaryButton type="button" disabled={pending} onClick={() => save(false)} className="flex-1 py-3">
          บันทึกฉบับร่าง
        </SecondaryButton>
        <PrimaryButton type="button" disabled={pending} onClick={() => save(true)} className="flex-1 py-3">
          {pending ? "กำลังบันทึก..." : "ส่งผลการประเมิน"}
        </PrimaryButton>
      </div>
    </div>
  );
}
