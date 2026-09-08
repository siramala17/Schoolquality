import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      position?: string | null;
      subjectGroup?: string | null;
      active?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    uid?: string;
    role?: Role;
    position?: string | null;
    subjectGroup?: string | null;
    active?: boolean;
  }
}
