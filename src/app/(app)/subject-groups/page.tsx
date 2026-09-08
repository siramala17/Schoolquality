import { getSubjectGroups } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import CrudManager from "@/components/crud/CrudManager";
import { createSubjectGroup, updateSubjectGroup, deleteSubjectGroup } from "@/lib/actions/lookups";

export default async function SubjectGroupsPage() {
  await requireRole(["ADMIN"]);
  const rows = await getSubjectGroups();

  return (
    <div>
      <SectionTitle icon="📚" count={rows.length}>
        กลุ่มสาระการเรียนรู้
      </SectionTitle>
      <CrudManager
        rows={rows}
        addLabel="เพิ่มกลุ่มสาระ"
        columns={[
          { key: "name", header: "กลุ่มสาระการเรียนรู้" },
          { key: "order", header: "ลำดับ" },
        ]}
        fields={[
          { name: "name", label: "ชื่อกลุ่มสาระ", required: true, placeholder: "คณิตศาสตร์" },
          { name: "order", label: "ลำดับการแสดง", type: "number" },
        ]}
        actions={{ create: createSubjectGroup, update: updateSubjectGroup, remove: deleteSubjectGroup }}
      />
    </div>
  );
}
