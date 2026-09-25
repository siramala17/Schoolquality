import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { ROLE_LABELS } from "@/lib/labels";
import { getSchool } from "@/lib/data/lookups";

export const dynamic = "force-dynamic";

const isDev = process.env.NODE_ENV !== "production";
const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;

export default async function LoginPage() {
  const devUsers = isDev
    ? await prisma.user
        .findMany({ where: { email: { not: null } }, orderBy: [{ role: "asc" }, { name: "asc" }] })
        .catch(() => [])
    : [];
  const school = await getSchool().catch(() => ({ name: "โรงเรียนเทศบาลวัดกลาง", department: "" }));

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0d9488 0%, #134e4a 55%, #1e3a8a 100%)" }}
    >
      <div className="w-full max-w-sm bg-surface rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full brand-gradient mx-auto flex items-center justify-center text-3xl mb-3">
            🏫
          </div>
          <h1 className="text-lg font-bold">ระบบนิเทศภายในโรงเรียน</h1>
          <p className="text-sm text-text-muted mt-1">ระบบบริหารจัดการและประเมินการนิเทศ</p>
          <p className="text-xs text-text-muted mt-2">{school.name}</p>
        </div>

        {googleEnabled && (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button className="w-full rounded-lg brand-gradient text-white py-2.5 font-medium hover:opacity-95">
              เข้าสู่ระบบด้วย Google
            </button>
          </form>
        )}

        {isDev && (
          <div className={googleEnabled ? "mt-6 pt-6 border-t border-border" : ""}>
            <p className="text-xs text-text-muted mb-3">โหมดพัฒนา — เข้าสู่ระบบโดยไม่ต้องตั้งค่า Google OAuth</p>

            {devUsers.length > 0 && (
              <div className="space-y-2 mb-4">
                {devUsers.map((u) => (
                  <form
                    key={u.id}
                    action={async () => {
                      "use server";
                      await signIn("dev-login", { email: u.email ?? "", name: u.name, redirectTo: "/dashboard" });
                    }}
                  >
                    <button className="w-full text-left rounded-lg border border-border px-3 py-2 text-sm hover:border-primary flex justify-between items-center gap-2">
                      <span className="truncate">
                        {u.name} <span className="text-text-muted">({u.email})</span>
                      </span>
                      <span className="text-xs text-text-muted shrink-0">{ROLE_LABELS[u.role]}</span>
                    </button>
                  </form>
                ))}
              </div>
            )}

            <form
              action={async (formData: FormData) => {
                "use server";
                const email = String(formData.get("email") || "").trim();
                if (!email) return;
                await signIn("dev-login", { email, name: email.split("@")[0], redirectTo: "/dashboard" });
              }}
              className="flex gap-2"
            >
              <input
                name="email"
                type="email"
                placeholder="อีเมลผู้ใช้ใหม่..."
                required
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
              />
              <button className="rounded-lg bg-text px-3 py-2 text-sm text-white shrink-0">เข้าสู่ระบบ</button>
            </form>
          </div>
        )}

        {!googleEnabled && !isDev && (
          <p className="text-sm text-bad text-center">ยังไม่ได้ตั้งค่าการเข้าสู่ระบบด้วย Google</p>
        )}
      </div>
    </div>
  );
}
