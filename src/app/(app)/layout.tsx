import { auth } from "@/auth";
import AppShell from "@/components/AppShell";

// Every page in this group is per-user and hits the database; never prerender.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return null; // middleware already redirects unauthenticated requests

  return <AppShell user={session.user}>{children}</AppShell>;
}
