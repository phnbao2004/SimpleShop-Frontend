"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { getApiError } from "@/lib/api";
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
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    api.get("/api/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => toast.error(getApiError(error, "Unable to load categories.")));
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (loading) return;

    const parsedMin = minPrice === "" ? null : Number(minPrice);
    const parsedMax = maxPrice === "" ? null : Number(maxPrice);
    let nextError = "";
    if (parsedMin !== null && (!Number.isFinite(parsedMin) || parsedMin < 0)) {
      nextError = "Minimum price cannot be negative.";
    } else if (parsedMax !== null && (!Number.isFinite(parsedMax) || parsedMax < 0)) {
      nextError = "Maximum price cannot be negative.";
    } else if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      nextError = "Minimum price cannot exceed maximum price.";
    }

    setValidationError(nextError);
    if (nextError) {
      toast.error(nextError);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (name.trim()) params.name = name.trim();
      if (categoryId) params.categoryId = categoryId;
      if (parsedMin !== null) params.minPrice = parsedMin;
      if (parsedMax !== null) params.maxPrice = parsedMax;
      const res = await api.get("/api/products/search", { params });
      setResults(res.data);
    } catch (error) {
      setResults([]);
      toast.error(getApiError(error, "Unable to search products."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Search Products</h1>
      <form onSubmit={handleSearch} className="mb-6 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
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
          min="0"
          step="0.01"
          className="rounded border px-3 py-2 text-sm"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max price"
          type="number"
          min="0"
          step="0.01"
          className="rounded border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
        {validationError && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{validationError}</p>}
      </form>

      {loading ? (
        <Spinner label="Searching..." />
      ) : searched && results.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : !searched ? (
        <p className="text-gray-500">Enter one or more filters, then select Search.</p>
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
