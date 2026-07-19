"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api, { getApiError } from "@/lib/api";
import { formatVND } from "@/lib/format";
import AuthGuard from "@/components/AuthGuard";
import Spinner from "@/components/Spinner";
import ConfirmDialog from "@/components/ConfirmDialog";

function CartContent() {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState({ type: null, item: null });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/api/cart");
      setCart(data);
      setError("");
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load cart."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateQuantity = async (item, value) => {
    if (busyId !== null || checkingOut) return;
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error("Quantity must be a whole number of at least 1");
      return;
    }
    setBusyId(item.id);
    try {
      const { data } = await api.put(`/api/cart/items/${item.id}`, { quantity });
      setCart(data);
    } catch (requestError) {
      toast.error(getApiError(requestError, "Unable to update quantity"));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (itemId) => {
    if (busyId !== null || checkingOut) return;
    setBusyId(itemId);
    try {
      await api.delete(`/api/cart/items/${itemId}`);
      await load();
      toast.success("Item removed");
    } catch (requestError) {
      toast.error(getApiError(requestError, "Unable to remove item"));
    } finally {
      setBusyId(null);
      setConfirm({ type: null, item: null });
    }
  };

  const checkout = async () => {
    if (checkingOut || busyId !== null) return;
    setCheckingOut(true);
    try {
      const { data } = await api.post("/api/orders/checkout");
      toast.success("Checkout completed");
      setConfirm({ type: null, item: null });
      router.push(`/orders/${data.orderId}`);
    } catch (requestError) {
      toast.error(getApiError(requestError, "Checkout failed"));
      await load();
      setConfirm({ type: null, item: null });
    } finally {
      setCheckingOut(false);
    }
  };

  const confirmAction = () => {
    if (confirm.type === "remove" && confirm.item) {
      remove(confirm.item.id);
    } else if (confirm.type === "checkout") {
      checkout();
    }
  };

  if (loading) return <Spinner label="Loading cart..." />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Cart</h1>
      {cart.items.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl || "https://via.placeholder.com/120?text=No+Image"} alt={item.productName} className="h-20 w-20 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-gray-500">{formatVND(item.unitPrice)} · Stock {item.availableStock}</p>
                </div>
                <input
                  type="number" min="1" max={item.availableStock} step="1" defaultValue={item.quantity}
                  disabled={busyId !== null || checkingOut}
                  onBlur={(event) => updateQuantity(item, event.target.value)}
                  className="w-24 rounded border px-3 py-2 text-sm"
                />
                <p className="w-32 font-semibold text-indigo-600">{formatVND(item.subtotal)}</p>
                <button
                  type="button"
                  onClick={() => setConfirm({ type: "remove", item })}
                  disabled={busyId !== null || checkingOut}
                  className="text-sm text-red-600 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-end gap-4">
            <p className="text-xl font-bold">Total: <span className="text-indigo-600">{formatVND(cart.total)}</span></p>
            <button
              type="button"
              onClick={() => setConfirm({ type: "checkout", item: null })}
              disabled={checkingOut || busyId !== null}
              className="rounded bg-indigo-600 px-6 py-2 text-white disabled:opacity-50"
            >
              {checkingOut ? "Checking out..." : "Checkout"}
            </button>
          </div>
        </>
      )}
      <ConfirmDialog
        open={Boolean(confirm.type)}
        title={confirm.type === "checkout" ? "Confirm Checkout" : "Remove Cart Item"}
        message={confirm.type === "checkout"
          ? "Checkout will create an order, reduce product stock, and remove the purchased items from your cart. Continue?"
          : `Remove ${confirm.item?.productName || "this item"} from your cart?`}
        confirmText={confirm.type === "checkout" ? "Checkout" : "Remove"}
        loadingText={confirm.type === "checkout" ? "Checking out..." : "Removing..."}
        tone={confirm.type === "checkout" ? "primary" : "danger"}
        loading={checkingOut || busyId !== null}
        onConfirm={confirmAction}
        onCancel={() => setConfirm({ type: null, item: null })}
      />
    </div>
  );
}

export default function CartPage() {
  return <AuthGuard userOnly><CartContent /></AuthGuard>;
}
