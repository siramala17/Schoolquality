import { auth } from "@/auth";
import AppShell from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return null; // middleware already redirects unauthenticated requests

  return <AppShell user={session.user}>{children}</AppShell>;
}
