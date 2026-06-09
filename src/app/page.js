"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Spinner from "@/components/Spinner";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading categories..." />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Shop by Category</h1>
      {categories.length === 0 ? (
        <p className="text-gray-500">No categories available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.categoryID}
              href={`/category/${c.categoryID}`}
              className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-indigo-600">{c.categoryName}</h2>
              <p className="mt-2 text-sm text-gray-600">{c.categoryDescription}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
