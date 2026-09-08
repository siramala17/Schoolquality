import { getSchool } from "@/lib/data/lookups";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import SchoolForm from "@/components/school/SchoolForm";

export default async function SchoolPage() {
  await requireRole(["ADMIN"]);
  const school = await getSchool();

  return (
    <div>
      <SectionTitle icon="🏫">ข้อมูลโรงเรียน</SectionTitle>
      <SchoolForm initial={{ name: school.name, department: school.department, address: school.address }} />
    </div>
  );
}
