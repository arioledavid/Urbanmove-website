import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      active: boolean;
    } & Omit<DefaultSession["user"], "name" | "image" | "email">;
  }

  interface User {
    id: string;
    email: string;
    role: Role;
    active: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    email: string;
    role: Role;
    active: boolean;
  }
}
