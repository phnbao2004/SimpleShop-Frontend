import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "SimpleShop",
  description: "Simple E-Commerce System - PRN232",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
