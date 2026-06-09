"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import AdminGuard from "@/components/AdminGuard";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatVND } from "@/lib/format";

const emptyForm = {
  productName: "",
  description: "",
  price: "",
  stockQuantity: "",
  imageUrl: "",
  categoryID: "",
  isActive: true,
};

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        api.get("/api/products/all"),
        api.get("/api/categories/all"),
      ]);
      setProducts(p.data);
      setCategories(c.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      productName: p.productName,
      description: p.description || "",
      price: String(p.price),
      stockQuantity: String(p.stockQuantity),
      imageUrl: p.imageUrl || "",
      categoryID: String(p.categoryID),
      isActive: p.isActive,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.productName.trim()) e.productName = "Name is required.";
    else if (form.productName.length > 200) e.productName = "Max 200 characters.";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = "Price must be >= 0.";
    if (form.stockQuantity === "" || isNaN(Number(form.stockQuantity)) || Number(form.stockQuantity) < 0)
      e.stockQuantity = "Stock must be >= 0.";
    if (!form.categoryID) e.categoryID = "Category is required.";
    if (form.imageUrl && form.imageUrl.length > 500) e.imageUrl = "Max 500 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      productName: form.productName,
      description: form.description || null,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      imageUrl: form.imageUrl || null,
      categoryID: Number(form.categoryID),
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await api.put(`/api/products/${editing.productID}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/api/products", payload);
        toast.success("Product created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = confirm.id;
    setConfirm({ open: false, id: null });
    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Product deactivated (soft-deleted)");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <Spinner label="Loading products..." />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={openCreate} className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
          + New Product
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productID} className="border-t">
                <td className="px-4 py-3">{p.productID}</td>
                <td className="px-4 py-3 font-medium">{p.productName}</td>
                <td className="px-4 py-3">{formatVND(p.price)}</td>
                <td className="px-4 py-3">{p.stockQuantity}</td>
                <td className="px-4 py-3">{p.categoryName}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="mr-3 text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => setConfirm({ open: true, id: p.productID })} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Product" : "New Product"} onClose={() => setModalOpen(false)}>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            {errors.productName && <p className="mt-1 text-xs text-red-600">{errors.productName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Price (VND)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              {errors.stockQuantity && <p className="mt-1 text-xs text-red-600">{errors.stockQuantity}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{errors.imageUrl}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select value={form.categoryID} onChange={(e) => setForm({ ...form, categoryID: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
              ))}
            </select>
            {errors.categoryID && <p className="mt-1 text-xs text-red-600">{errors.categoryID}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Product"
        message="This product will be soft-deleted (set to inactive). Continue?"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AdminGuard>
      <ProductsContent />
    </AdminGuard>
  );
}
