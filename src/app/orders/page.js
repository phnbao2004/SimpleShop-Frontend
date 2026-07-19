"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { getApiError } from "@/lib/api";
import { formatDate, formatVND } from "@/lib/format";
import AuthGuard from "@/components/AuthGuard";
import Spinner from "@/components/Spinner";
import OrderStatusBadge from "@/components/OrderStatusBadge";

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/orders")
      .then(({ data }) => setOrders(data))
      .catch((requestError) => setError(getApiError(requestError, "Unable to load orders.")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading orders..." />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>
      {orders.length === 0 ? <p className="text-gray-500">You have no orders yet.</p> : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Total</th><th className="px-4 py-3"></th></tr></thead>
            <tbody>{orders.map((order) => (
              <tr key={order.orderId} className="border-t">
                <td className="px-4 py-3 font-medium">#{order.orderId}</td>
                <td className="px-4 py-3">{formatDate(order.createdDate)}</td>
                <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                <td className="px-4 py-3">{order.items.length}</td>
                <td className="px-4 py-3 font-semibold">{formatVND(order.total)}</td>
                <td className="px-4 py-3 text-right"><Link href={`/orders/${order.orderId}`} className="text-indigo-600">View</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return <AuthGuard userOnly><OrdersContent /></AuthGuard>;
}
