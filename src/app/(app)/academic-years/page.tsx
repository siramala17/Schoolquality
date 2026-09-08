import { getAcademicYears } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import CrudManager from "@/components/crud/CrudManager";
import { createAcademicYear, updateAcademicYear, deleteAcademicYear } from "@/lib/actions/lookups";

export default async function AcademicYearsPage() {
  await requireRole(["ADMIN"]);
  const rows = await getAcademicYears();

  return (
    <div>
      <SectionTitle icon="📅" count={rows.length}>
        จัดการปีการศึกษา
      </SectionTitle>
      <CrudManager
        rows={rows}
        addLabel="เพิ่มปีการศึกษา"
        columns={[
          { key: "year", header: "ปีการศึกษา" },
          { key: "active", header: "สถานะ", cell: "bool", trueText: "ใช้งานอยู่", falseText: "ปิดใช้งาน" },
        ]}
        fields={[
          { name: "year", label: "ปีการศึกษา (พ.ศ.)", required: true, placeholder: "2568" },
          { name: "active", label: "กำหนดเป็นปีการศึกษาปัจจุบัน", type: "checkbox" },
        ]}
        actions={{ create: createAcademicYear, update: updateAcademicYear, remove: deleteAcademicYear }}
      />
    </div>
  );
}
