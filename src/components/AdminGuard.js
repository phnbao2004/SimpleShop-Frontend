"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";

export default function AdminGuard({ children }) {
  const { isAuthenticated, loaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [loaded, isAuthenticated, router]);

  if (!loaded) return <Spinner />;
  if (!isAuthenticated) return <Spinner label="Redirecting to login..." />;
  return children;
}
