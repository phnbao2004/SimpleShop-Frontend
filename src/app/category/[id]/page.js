"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Spinner from "@/components/Spinner";
import ProductCard from "@/components/ProductCard";

export default function CategoryProductsPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/api/products/category/${id}`).then((r) => r.data).catch(() => []),
      api.get(`/api/categories/${id}`).then((r) => r.data).catch(() => null),
    ])
      .then(([prods, cat]) => {
        setProducts(prods);
        setCategory(cat);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading products..." />;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{category ? category.categoryName : "Category"}</h1>
      {category && <p className="mb-6 text-gray-600">{category.categoryDescription}</p>}
      {products.length === 0 ? (
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
