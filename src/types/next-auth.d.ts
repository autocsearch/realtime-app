import type { Session as NextAuthSession, User } from "next-auth";
import type { JWT as NextAuthJwt } from "next-auth/jwt";

type UserId = string;

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJwt {
    id: UserId;
  }
}

declare module "next-auth" {
  interface Session extends NextAuthSession {
    user: User & {
      id: UserId;
    };
  }
}
