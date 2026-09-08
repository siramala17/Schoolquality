import Link from "next/link";
import { notFound } from "next/navigation";
import { getForm } from "@/lib/data/forms";
import { requireRole } from "@/lib/auth-helpers";
import { SectionTitle } from "@/components/ui";
import FormEditor from "@/components/forms/FormEditor";

export default async function EditFormPage({ params }: PageProps<"/assessment-forms/[id]">) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const form = await getForm(id);
  if (!form) notFound();

  return (
    <div>
      <Link href="/assessment-forms" className="text-sm text-primary hover:underline">
        ← กลับไปรายการแบบประเมิน
      </Link>
      <SectionTitle icon="📋">{form.name}</SectionTitle>
      <FormEditor formId={form.id} domains={form.domains} />
    </div>
  );
}
