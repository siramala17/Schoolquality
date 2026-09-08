import { getQualityLevels } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import CrudManager from "@/components/crud/CrudManager";
import { createQualityLevel, updateQualityLevel, deleteQualityLevel } from "@/lib/actions/lookups";

export default async function QualityLevelsPage() {
  await requireRole(["ADMIN"]);
  const rows = await getQualityLevels();

  return (
    <div>
      <SectionTitle icon="⭐" count={rows.length}>
        เกณฑ์ระดับคุณภาพ
      </SectionTitle>
      <CrudManager
        rows={rows}
        addLabel="เพิ่มเกณฑ์"
        columns={[
          { key: "minScore", header: "คะแนนเฉลี่ยต่ำสุด", cell: "number2" },
          { key: "maxScore", header: "คะแนนเฉลี่ยสูงสุด", cell: "number2" },
          { key: "label", header: "ระดับคุณภาพ", cell: "level", colorKey: "color" },
        ]}
        fields={[
          { name: "minScore", label: "คะแนนเฉลี่ยต่ำสุด", type: "number", step: "0.01", required: true },
          { name: "maxScore", label: "คะแนนเฉลี่ยสูงสุด", type: "number", step: "0.01", required: true },
          { name: "label", label: "ชื่อระดับคุณภาพ", required: true, placeholder: "ดีเยี่ยม" },
          { name: "color", label: "สี (hex)", placeholder: "#0d9488" },
          { name: "order", label: "ลำดับ", type: "number" },
        ]}
        actions={{ create: createQualityLevel, update: updateQualityLevel, remove: deleteQualityLevel }}
      />
    </div>
  );
}
