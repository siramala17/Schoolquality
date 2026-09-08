import { getClassrooms } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import CrudManager from "@/components/crud/CrudManager";
import { createClassroom, updateClassroom, deleteClassroom } from "@/lib/actions/lookups";

export default async function ClassroomsPage() {
  await requireRole(["ADMIN"]);
  const rows = await getClassrooms();

  return (
    <div>
      <SectionTitle icon="🚪" count={rows.length}>
        จัดการชั้นเรียน
      </SectionTitle>
      <CrudManager
        rows={rows}
        addLabel="เพิ่มชั้นเรียน"
        columns={[
          { key: "name", header: "ชั้นเรียน" },
          { key: "order", header: "ลำดับ" },
        ]}
        fields={[
          { name: "name", label: "ชื่อชั้นเรียน", required: true, placeholder: "ม.1/1" },
          { name: "order", label: "ลำดับการแสดง", type: "number" },
        ]}
        actions={{ create: createClassroom, update: updateClassroom, remove: deleteClassroom }}
      />
    </div>
  );
}
