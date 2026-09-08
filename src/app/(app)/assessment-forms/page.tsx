import { getAssessmentForms } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import CrudManager from "@/components/crud/CrudManager";
import { createForm, updateForm, deleteForm } from "@/lib/actions/forms";

export default async function AssessmentFormsPage() {
  await requireRole(["ADMIN"]);
  const forms = await getAssessmentForms();
  const rows = forms.map((f) => ({
    id: f.id,
    name: f.name,
    active: f.active,
    domains: f._count.domains,
    assignments: f._count.assignments,
  }));

  return (
    <div>
      <SectionTitle icon="📋" count={rows.length}>
        จัดการแบบประเมิน
      </SectionTitle>
      <CrudManager
        rows={rows}
        addLabel="เพิ่มแบบประเมิน"
        columns={[
          { key: "name", header: "ชื่อแบบประเมิน", link: { prefix: "/assessment-forms/" } },
          { key: "domains", header: "จำนวนด้าน" },
          { key: "assignments", header: "ถูกใช้ (ครั้ง)" },
          { key: "active", header: "สถานะ", cell: "bool" },
        ]}
        fields={[
          { name: "name", label: "ชื่อแบบประเมิน", required: true, placeholder: "แบบประเมินการนิเทศภายใน" },
          { name: "active", label: "เปิดใช้งาน", type: "checkbox" },
        ]}
        actions={{ create: createForm, update: updateForm, remove: deleteForm }}
      />
      <p className="text-xs text-text-muted mt-3">คลิกชื่อแบบประเมินเพื่อแก้ไขด้านและรายการประเมิน</p>
    </div>
  );
}
