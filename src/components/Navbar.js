"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-indigo-600">SimpleShop</Link>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <Link href="/products" className="hover:text-indigo-600">Products</Link>
          <Link href="/search" className="hover:text-indigo-600">Search</Link>
          {!loading && (isAuthenticated ? (
            <>
              <Link href="/admin/categories" className="hover:text-indigo-600">My Categories</Link>
              <Link href="/admin/products" className="hover:text-indigo-600">My Products</Link>
              {!isAdmin && <Link href="/cart" className="hover:text-indigo-600">Cart</Link>}
              {!isAdmin && <Link href="/orders" className="hover:text-indigo-600">Orders</Link>}
              {isAdmin && <Link href="/admin" className="hover:text-indigo-600">Dashboard</Link>}
              <span className="text-gray-500">Hello, {user?.name}</span>
              <button onClick={handleLogout} className="rounded bg-gray-100 px-3 py-1 hover:bg-gray-200">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-600">Login</Link>
              <Link href="/register" className="rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700">
                Register
              </Link>
            </>
          ))}
        </div>
      </nav>
    </header>
  );
}
