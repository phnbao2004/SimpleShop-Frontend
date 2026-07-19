"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api, { getApiError } from "@/lib/api";
import Spinner from "@/components/Spinner";
import ProductCard from "@/components/ProductCard";

export default function CategoryProductsPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/api/products/category/${id}`).then((response) => response.data),
      api.get(`/api/categories/${id}`).then((response) => response.data),
    ])
      .then(([prods, cat]) => {
        setProducts(prods);
        setCategory(cat);
        setError("");
      })
      .catch((requestError) => {
        setProducts([]);
        setCategory(null);
        setError(getApiError(requestError, "Unable to load this category."));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading products..." />;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{category ? category.categoryName : "Category"}</h1>
      {category && <p className="mb-6 text-gray-600">{category.categoryDescription}</p>}
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products in this category.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.productID} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
