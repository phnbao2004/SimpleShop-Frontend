"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Spinner from "@/components/Spinner";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/products")
      .then((response) => setProducts(response.data))
      .catch(() => setError("Unable to load products."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading products..." />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Products</h1>
      {error ? <p className="text-red-600">{error}</p> : products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.productID} product={product} />)}
        </div>
      )}
    </div>
  );
}
