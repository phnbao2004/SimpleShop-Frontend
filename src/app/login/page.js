"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const message = sessionStorage.getItem("auth_message");
    if (!message) return;
    sessionStorage.removeItem("auth_message");
    toast.error(message);
  }, []);

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Invalid email format.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", form);
      const user = { userId: data.userId, name: data.name, email: data.email, role: data.role };
      login(data.token, user);
      toast.success("Logged in successfully");
      router.push(data.role === "Admin" ? "/admin" : "/");
    } catch (error) {
      toast.error(getApiError(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm rounded-lg border bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-bold">Login</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>
        <button type="submit" disabled={loading} className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-center text-sm text-gray-500">No account? <Link href="/register" className="text-indigo-600">Register</Link></p>
      </div>
    </form>
  );
}
