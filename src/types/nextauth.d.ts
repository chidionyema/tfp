// src/types/nextauth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    emailVerified?: Date | null;
  }
}
