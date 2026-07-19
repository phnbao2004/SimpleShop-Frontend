"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { getApiError } from "@/lib/api";
import AdminGuard from "@/components/AdminGuard";
import Spinner from "@/components/Spinner";

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-indigo-600">{value}</p>
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/dashboard/stats")
      .then((r) => setStats(r.data))
      .catch((requestError) => {
        setStats(null);
        setError(getApiError(requestError, "Unable to load dashboard statistics."));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      {error && <p className="mb-6 text-red-600">{error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Categories" value={stats?.totalCategories ?? 0} />
        <StatCard label="Total Products" value={stats?.totalProducts ?? 0} />
        <StatCard label="Active Products" value={stats?.totalActiveProducts ?? 0} />
      </div>
      <div className="mt-8 flex gap-4">
        <Link href="/admin/categories" className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
          Manage Categories
        </Link>
        <Link href="/admin/products" className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
          Manage Products
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}
