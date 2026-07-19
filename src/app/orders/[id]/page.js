"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api, { getApiError } from "@/lib/api";
import { formatDate, formatVND } from "@/lib/format";
import AuthGuard from "@/components/AuthGuard";
import Spinner from "@/components/Spinner";
import OrderStatusBadge from "@/components/OrderStatusBadge";

function OrderDetailContent() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.get(`/api/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((requestError) => setError(getApiError(requestError, "Unable to load order.")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading order..." />;
  if (error || !order) return <p className="text-red-600">{error || "Order not found."}</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
        <p className="mt-1 text-sm text-gray-500">{formatDate(order.createdDate)}</p>
        <div className="mt-3"><OrderStatusBadge status={order.status} /></div>
      </div>
      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl || "https://via.placeholder.com/120?text=No+Image"} alt={item.productName} className="h-16 w-16 rounded object-cover" />
            <div className="flex-1"><p className="font-semibold">{item.productName}</p><p className="text-sm text-gray-500">{formatVND(item.unitPrice)} × {item.quantity}</p></div>
            <p className="font-semibold">{formatVND(item.subtotal)}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-right text-xl font-bold">Total: <span className="text-indigo-600">{formatVND(order.total)}</span></p>
    </div>
  );
}

export default function OrderDetailPage() {
  return <AuthGuard userOnly><OrderDetailContent /></AuthGuard>;
}
