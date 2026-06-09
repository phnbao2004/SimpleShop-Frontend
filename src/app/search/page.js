"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Spinner from "@/components/Spinner";
import ProductCard from "@/components/ProductCard";

export default function SearchPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get("/api/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (name.trim()) params.name = name.trim();
      if (categoryId) params.categoryId = categoryId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await api.get("/api/products/search", { params });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Search Products</h1>
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
          className="rounded border px-3 py-2 text-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
          ))}
        </select>
        <input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min price"
          type="number"
          className="rounded border px-3 py-2 text-sm"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max price"
          type="number"
          className="rounded border px-3 py-2 text-sm"
        />
        <button
          onClick={handleSearch}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </div>

      {loading ? (
        <Spinner label="Searching..." />
      ) : searched && results.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.productID} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
