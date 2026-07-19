"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";

export default function AuthGuard({ children, userOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const allowed = isAuthenticated && (!userOnly || user?.role === "User");

  useEffect(() => {
    if (!loading && !allowed) router.replace("/login");
  }, [loading, allowed, router]);

  if (loading || !allowed) return <Spinner label="Checking access..." />;
  return children;
}
