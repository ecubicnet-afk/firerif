import type { Role, SubscriptionStatus } from "@/generated/prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
      subscriptionStatus: SubscriptionStatus;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
    subscriptionStatus: SubscriptionStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    subscriptionStatus: SubscriptionStatus;
  }
}
