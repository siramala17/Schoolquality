"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label, inputClass, PrimaryButton } from "@/components/ui";
import { saveSchool } from "@/lib/actions/school";

export default function SchoolForm({
  initial,
}: {
  initial: { name: string; department: string; address: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [department, setDepartment] = useState(initial.department);
  const [address, setAddress] = useState(initial.address ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await saveSchool({ name, department, address });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={submit} className="bg-surface rounded-xl shadow-sm border border-border p-5 max-w-xl">
      {saved && <div className="mb-4 rounded-lg bg-green-50 text-good text-sm px-3 py-2">บันทึกข้อมูลโรงเรียนแล้ว</div>}
      <Label text="ชื่อโรงเรียน">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </Label>
      <Label text="สังกัด / หน่วยงาน">
        <input className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)} required />
      </Label>
      <Label text="ที่อยู่">
        <textarea className={inputClass} rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
      </Label>
      <PrimaryButton type="submit" disabled={pending} className="mt-2">
        {pending ? "กำลังบันทึก..." : "บันทึก"}
      </PrimaryButton>
    </form>
  );
}
