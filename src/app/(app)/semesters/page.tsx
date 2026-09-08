import { getSemesters } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import CrudManager from "@/components/crud/CrudManager";
import { createSemester, updateSemester, deleteSemester } from "@/lib/actions/lookups";

export default async function SemestersPage() {
  await requireRole(["ADMIN"]);
  const rows = await getSemesters();

  return (
    <div>
      <SectionTitle icon="🗓️" count={rows.length}>
        จัดการภาคเรียน
      </SectionTitle>
      <CrudManager
        rows={rows}
        addLabel="เพิ่มภาคเรียน"
        columns={[
          { key: "name", header: "ภาคเรียน" },
          { key: "order", header: "ลำดับ" },
        ]}
        fields={[
          { name: "name", label: "ชื่อภาคเรียน", required: true, placeholder: "ภาคเรียนที่ 1" },
          { name: "order", label: "ลำดับการแสดง", type: "number" },
        ]}
        actions={{ create: createSemester, update: updateSemester, remove: deleteSemester }}
      />
    </div>
  );
}
