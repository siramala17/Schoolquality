import { auth } from "@/auth";
import AppShell from "@/components/AppShell";
import SplashScreen from "@/components/SplashScreen";
import { getSchool } from "@/lib/data/lookups";

// Every page in this group is per-user and hits the database; never prerender.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return null; // proxy already redirects unauthenticated requests

  const school = await getSchool();

  return (
    <>
      <SplashScreen />
      <AppShell user={session.user} schoolName={school.name}>
        {children}
      </AppShell>
    </>
  );
}
