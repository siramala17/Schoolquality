import { getEvidenceList } from "@/lib/data/evidence";
import { getObservations } from "@/lib/data/observations";
import { Card, EmptyState } from "@/components/ui";
import { fmtDateTH } from "@/lib/date";
import UploadEvidenceButton from "@/components/evidence/UploadEvidenceButton";
import DeleteEvidenceButton from "@/components/evidence/DeleteEvidenceButton";

function fileIcon(type: string) {
  if (type.includes("image")) return "🖼️";
  if (type.includes("pdf")) return "📕";
  if (type.includes("word")) return "📘";
  if (type.includes("presentation")) return "📙";
  return "📄";
}

export default async function EvidencePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const [list, obsList] = await Promise.all([getEvidenceList(q), getObservations()]);
  const obsOptions = obsList.map((o) => ({ id: o.id, teacherName: o.teacher.name, date: fmtDateTH(o.date) }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <form className="flex-1" action="/evidence">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="ค้นหาหลักฐาน..."
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface"
          />
        </form>
        <UploadEvidenceButton obsOptions={obsOptions} />
      </div>
      <Card>
        {list.length === 0 ? (
          <EmptyState>ยังไม่มีหลักฐาน</EmptyState>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((ev) => (
              <div key={ev.id} className="border border-border rounded-lg p-4">
                <div className="text-2xl mb-2">{fileIcon(ev.fileType)}</div>
                <div className="font-semibold text-sm break-words">{ev.fileName}</div>
                <div className="text-xs text-text-muted mt-1">
                  {ev.uploader.name} · {fmtDateTH(ev.uploadedAt)}
                </div>
                <div className="flex gap-3 mt-3">
                  <a href={`/api/evidence/${ev.id}`} target="_blank" className="text-xs text-primary hover:underline">
                    เปิดไฟล์
                  </a>
                  <DeleteEvidenceButton id={ev.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
