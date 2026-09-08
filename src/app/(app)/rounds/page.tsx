import { getRounds } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import CrudManager from "@/components/crud/CrudManager";
import { createRound, updateRound, deleteRound } from "@/lib/actions/lookups";

export default async function RoundsPage() {
  await requireRole(["ADMIN"]);
  const rows = await getRounds();

  return (
    <div>
      <SectionTitle icon="🔄" count={rows.length}>
        จัดการรอบที่
      </SectionTitle>
      <CrudManager
        rows={rows}
        addLabel="เพิ่มรอบการนิเทศ"
        columns={[
          { key: "name", header: "รอบที่" },
          { key: "order", header: "ลำดับ" },
        ]}
        fields={[
          { name: "name", label: "ชื่อรอบ", required: true, placeholder: "รอบที่ 1" },
          { name: "order", label: "ลำดับการแสดง", type: "number" },
        ]}
        actions={{ create: createRound, update: updateRound, remove: deleteRound }}
      />
    </div>
  );
}
