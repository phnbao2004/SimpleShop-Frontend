"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Name must contain at least 2 characters.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "A valid email is required.";
    if (form.password.length < 8) next.password = "Password must contain at least 8 characters.";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", {
        name: form.name.trim(), email: form.email.trim(), password: form.password,
      });
      const user = { userId: data.userId, name: data.name, email: data.email, role: data.role };
      login(data.token, user);
      toast.success("Account created successfully");
      router.push("/");
    } catch (error) {
      toast.error(getApiError(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm rounded-lg border bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-bold">Create account</h1>
      <div className="space-y-4">
        {[
          ["name", "Name", "text"], ["email", "Email", "email"],
          ["password", "Password", "password"], ["confirm", "Confirm password", "password"],
        ].map(([key, label, type]) => (
          <div key={key}>
            <label className="block text-sm font-medium">{label}</label>
            <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
          </div>
        ))}
        <button type="submit" disabled={loading} className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="text-center text-sm text-gray-500">Already registered? <Link href="/login" className="text-indigo-600">Login</Link></p>
      </div>
    </form>
  );
}
