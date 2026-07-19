"use client";

import Link from "next/link";
import { formatVND } from "@/lib/format";

export default function ProductCard({ product }) {
  return (
    <Link
      href={`/products/${product.productID}`}
      className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="h-44 w-full bg-gray-100">
        {/* Using a plain img tag to avoid next/image domain config issues */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={product.productName}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold">{product.productName}</h3>
        <p className="mt-1 text-indigo-600 font-bold">{formatVND(product.price)}</p>
        <p className={`mt-1 text-xs ${product.stockQuantity > 0 ? "text-gray-500" : "font-medium text-red-600"}`}>
          {product.stockQuantity > 0 ? `In stock: ${product.stockQuantity}` : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}
