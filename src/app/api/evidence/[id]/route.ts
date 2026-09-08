import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const ev = await prisma.evidence.findUnique({ where: { id } });
  if (!ev) return NextResponse.json({ error: "not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(ev.fileData), {
    headers: {
      "Content-Type": ev.fileType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(ev.fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
