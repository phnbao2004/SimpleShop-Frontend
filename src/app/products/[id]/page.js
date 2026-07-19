"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Spinner from "@/components/Spinner";
import { formatVND } from "@/lib/format";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/lib/api";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!id) return;
    api
      .get(`/api/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch((requestError) => {
        if (requestError?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(getApiError(requestError, "Unable to load product."));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading product..." />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (notFound || !product) return <p className="text-gray-500">Product not found.</p>;

  const canAddToCart = isAuthenticated && user?.role === "User" &&
    String(product.ownerId) !== String(user.userId) && product.stockQuantity > 0;

  const addToCart = async () => {
    setAdding(true);
    try {
      await api.post("/api/cart/items", { productId: product.productID, quantity: 1 });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(getApiError(error, "Could not add product to cart"));
    } finally {
      setAdding(false);
    }
  };

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
        <p className={`mt-2 text-sm ${product.stockQuantity > 0 ? "text-gray-600" : "font-medium text-red-600"}`}>
          {product.stockQuantity > 0 ? `Stock quantity: ${product.stockQuantity}` : "Out of stock"}
        </p>
        <p className="mt-6 whitespace-pre-line text-gray-700">
          {product.description || "No description available."}
        </p>
        {canAddToCart && (
          <button onClick={addToCart} disabled={adding} className="mt-6 rounded bg-indigo-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50">
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        )}
        {isAuthenticated && user?.role === "User" && String(product.ownerId) === String(user.userId) && (
          <p className="mt-6 text-sm text-gray-500">This is your product.</p>
        )}
      </div>
    </div>
  );
}
