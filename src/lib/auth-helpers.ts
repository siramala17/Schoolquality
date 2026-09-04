import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

export class AuthError extends Error {}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new AuthError("กรุณาเข้าสู่ระบบ");
  return session.user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthError("คุณไม่มีสิทธิ์ทำรายการนี้");
  return user;
}
