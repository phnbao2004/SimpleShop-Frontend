"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email format.";
    if (!password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      login(res.data.token, res.data.email);
      toast.success("Logged in successfully");
      router.push("/admin");
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm rounded-lg border bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-bold">Admin Login</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            placeholder="admin@simpleshop.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
