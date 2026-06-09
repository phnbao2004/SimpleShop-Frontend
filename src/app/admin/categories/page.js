"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import AdminGuard from "@/components/AdminGuard";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = { categoryName: "", categoryDescription: "", isActive: true };

function CategoriesContent() {
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
      const res = await api.get("/api/categories/all");
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories");
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

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      categoryName: c.categoryName,
      categoryDescription: c.categoryDescription,
      isActive: c.isActive,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.categoryName.trim()) e.categoryName = "Name is required.";
    else if (form.categoryName.length > 100) e.categoryName = "Max 100 characters.";
    if (!form.categoryDescription.trim()) e.categoryDescription = "Description is required.";
    else if (form.categoryDescription.length > 250) e.categoryDescription = "Max 250 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/categories/${editing.categoryID}`, form);
        toast.success("Category updated");
      } else {
        await api.post("/api/categories", form);
        toast.success("Category created");
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
      await api.delete(`/api/categories/${id}`);
      toast.success("Category deleted");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <Spinner label="Loading categories..." />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openCreate} className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
          + New Category
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.categoryID} className="border-t">
                <td className="px-4 py-3">{c.categoryID}</td>
                <td className="px-4 py-3 font-medium">{c.categoryName}</td>
                <td className="px-4 py-3 text-gray-600">{c.categoryDescription}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="mr-3 text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => setConfirm({ open: true, id: c.categoryID })} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Category" : "New Category"} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              value={form.categoryName}
              onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
            {errors.categoryName && <p className="mt-1 text-xs text-red-600">{errors.categoryName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={form.categoryDescription}
              onChange={(e) => setForm({ ...form, categoryDescription: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
            {errors.categoryDescription && <p className="mt-1 text-xs text-red-600">{errors.categoryDescription}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
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
        title="Delete Category"
        message="This category will be permanently deleted. It can only be deleted if no products are linked to it."
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <AdminGuard>
      <CategoriesContent />
    </AdminGuard>
  );
}
