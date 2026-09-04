"use client";

import { useState, useTransition } from "react";
import { RUBRIC, computeScores } from "@/lib/rubric";
import { submitObservation } from "@/lib/actions/observations";
import { PrimaryButton, Label, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/date";

type Teacher = { id: string; name: string; email: string; subjectGroup: string | null };
type PlanOption = {
  id: string;
  teacherId: string;
  date: Date;
  topic: string | null;
  subjectGroup: string | null;
  teacher: { name: string };
};

function emptyScores(): Record<string, number[]> {
  return Object.fromEntries(RUBRIC.map((d) => [d.key, Array(d.items.length).fill(0)]));
}

export default function ObservationForm({ teachers, plans }: { teachers: Teacher[]; plans: PlanOption[] }) {
  const [scores, setScores] = useState<Record<string, number[]>>(emptyScores);
  const [teacherId, setTeacherId] = useState("");
  const [planId, setPlanId] = useState("");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [subject, setSubject] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [subjectGroup, setSubjectGroup] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function setScore(domainKey: string, idx: number, val: number) {
    setScores((s) => {
      const next = { ...s, [domainKey]: [...s[domainKey]] };
      next[domainKey][idx] = val;
      return next;
    });
  }

  function onPlanChange(id: string) {
    setPlanId(id);
    const plan = plans.find((p) => p.id === id);
    if (plan) {
      setTeacherId(plan.teacherId);
      setSubjectGroup(plan.subjectGroup || "");
      setDate(toDateInputValue(plan.date));
    }
  }

  const complete = RUBRIC.every((d) => scores[d.key].every((v) => v > 0));
  const { domainScores, overallScore, level } = computeScores(scores);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teacherId) {
      setError("กรุณาเลือกครูผู้รับการสังเกต");
      return;
    }
    if (!complete) {
      setError("กรุณาให้คะแนนครบทุกรายการ");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await submitObservation({
          planId: planId || undefined,
          teacherId,
          date,
          subject,
          classRoom,
          subjectGroup,
          scores,
          feedback: { strengths, improvements, suggestions },
        });
        setSuccess(true);
        setScores(emptyScores());
        setTeacherId("");
        setPlanId("");
        setSubject("");
        setClassRoom("");
        setSubjectGroup("");
        setStrengths("");
        setImprovements("");
        setSuggestions("");
        setTimeout(() => setSuccess(false), 3500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
      <h3 className="font-semibold text-lg mb-4">แบบสังเกตการสอนออนไลน์</h3>
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 text-good text-sm px-3 py-2">บันทึกผลการสังเกตการสอนเรียบร้อย</div>
      )}
      <form onSubmit={onSubmit}>
        <div className="grid md:grid-cols-3 gap-x-3">
          <Label text="อ้างอิงแผนนิเทศ (ถ้ามี)">
            <select className={inputClass} value={planId} onChange={(e) => onPlanChange(e.target.value)}>
              <option value="">-- ไม่อ้างอิง --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.teacher.name} - {toDateInputValue(p.date)}
                  {p.topic ? ` - ${p.topic}` : ""}
                </option>
              ))}
            </select>
          </Label>
          <Label text="ครูผู้รับการสังเกต">
            <select className={inputClass} value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
              <option value="">เลือกครู</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Label>
          <Label text="วันที่">
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} required />
          </Label>
        </div>
        <div className="grid md:grid-cols-3 gap-x-3">
          <Label text="วิชา">
            <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Label>
          <Label text="ห้องเรียน">
            <input className={inputClass} value={classRoom} onChange={(e) => setClassRoom(e.target.value)} />
          </Label>
          <Label text="กลุ่มสาระ">
            <input className={inputClass} value={subjectGroup} onChange={(e) => setSubjectGroup(e.target.value)} />
          </Label>
        </div>

        <div className="space-y-3 my-4">
          {RUBRIC.map((domain) => (
            <div key={domain.key} className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-primary-dark mb-2 text-sm">{domain.name}</h4>
              {domain.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 py-2 border-t border-dashed border-border first:border-t-0"
                >
                  <div className="text-sm flex-1">{item}</div>
                  <div className="flex gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setScore(domain.key, idx, v)}
                        className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-colors ${
                          scores[domain.key][idx] === v
                            ? "bg-primary border-primary text-white"
                            : "border-border text-text-muted hover:border-primary"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="bg-bg border border-border rounded-lg p-4 flex flex-wrap gap-6 mb-4">
          {RUBRIC.map((d) => (
            <div key={d.key} className="text-sm">
              <div className="text-text-muted text-xs">{d.name}</div>
              <div className="font-bold">{scores[d.key].some((v) => v > 0) ? domainScores[d.key] : "-"}</div>
            </div>
          ))}
          <div className="text-sm">
            <div className="text-text-muted text-xs">คะแนนรวม</div>
            <div className="font-bold">{complete ? overallScore : "-"}</div>
          </div>
          <div className="text-sm">
            <div className="text-text-muted text-xs">ระดับคุณภาพ</div>
            <div className="font-bold">{complete ? level : "-"}</div>
          </div>
        </div>

        <div className="bg-bg border border-border rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2 text-sm">ข้อเสนอแนะและติดตามผล</h4>
          <Label text="จุดเด่น">
            <textarea className={inputClass} rows={2} value={strengths} onChange={(e) => setStrengths(e.target.value)} />
          </Label>
          <Label text="สิ่งที่ควรพัฒนา">
            <textarea
              className={inputClass}
              rows={2}
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
            />
          </Label>
          <Label text="ข้อเสนอแนะ">
            <textarea
              className={inputClass}
              rows={2}
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
            />
          </Label>
        </div>

        {error && <p className="text-sm text-bad mb-3">{error}</p>}
        <PrimaryButton type="submit" disabled={pending} className="w-full py-3 text-base">
          {pending ? "กำลังบันทึก..." : "บันทึกผลการสังเกตการสอน"}
        </PrimaryButton>
      </form>
    </div>
  );
}
