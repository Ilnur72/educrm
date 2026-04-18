"use client";
import { useSession } from "next-auth/react";
import type { Role } from "@/types";

export function useCurrentUser() {
  const { data: session, status } = useSession();
  return {
    user:      session?.user,
    role:      session?.user?.role as Role | undefined,
    isAdmin:   session?.user?.role === "ADMIN",
    isTeacher: session?.user?.role === "OQITUVCHI",
    isLoading: status === "loading",
  };
}

export function useHasRole(roles: Role[]) {
  const { role } = useCurrentUser();
  return role ? roles.includes(role) : false;
}
