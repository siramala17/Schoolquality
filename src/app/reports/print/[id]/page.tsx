import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAssignment } from "@/lib/data/assignments";
import { getQualityLevelsForScoring, getSchool } from "@/lib/data/lookups";
import PrintReport from "@/components/reports/PrintReport";
import PrintTrigger from "@/components/reports/PrintTrigger";

export const dynamic = "force-dynamic";

// The page title becomes the default file name in the browser's "Save as PDF".
export async function generateMetadata({ params }: PageProps<"/reports/print/[id]">): Promise<Metadata> {
  const { id } = await params;
  const a = await getAssignment(id);
  if (!a) return {};
  return {
    title: `ผลการนิเทศ_${a.teacher.name}_${a.round.name}_${a.semester.name}_${a.academicYear.year}`,
  };
}

export default async function PrintReportPage({ params }: PageProps<"/reports/print/[id]">) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const [assignment, levels, school] = await Promise.all([
    getAssignment(id),
    getQualityLevelsForScoring(),
    getSchool(),
  ]);
  if (!assignment) notFound();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-text">
      <PrintTrigger />
      <PrintReport assignment={assignment} levels={levels} school={school} />
    </div>
  );
}
