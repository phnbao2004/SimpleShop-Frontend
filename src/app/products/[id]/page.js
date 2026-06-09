"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Spinner from "@/components/Spinner";
import { formatVND } from "@/lib/format";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/api/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading product..." />;
  if (notFound || !product) return <p className="text-gray-500">Product not found.</p>;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="h-80 w-full overflow-hidden rounded-lg bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}
          alt={product.productName}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/600x400?text=No+Image";
          }}
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{product.productName}</h1>
        <p className="mt-1 text-sm text-gray-500">Category: {product.categoryName}</p>
        <p className="mt-4 text-3xl font-bold text-indigo-600">{formatVND(product.price)}</p>
        <p className="mt-2 text-sm text-gray-600">Stock quantity: {product.stockQuantity}</p>
        <p className="mt-6 whitespace-pre-line text-gray-700">
          {product.description || "No description available."}
        </p>
      </div>
    </div>
  );
}
