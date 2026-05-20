"use client"

import "./admin.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  Users,
  ShoppingCart,
  Tags,
  UserCheck,
  TrendingUp,
  BarChart2,
  LogOut,
  Menu,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "2") {
      setAllowed(true);
    } else {
      router.push("/");
    }

    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: BarChart2 },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/categories", label: "Categories", icon: Tags },
    { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { path: "/admin/roles", label: "Roles", icon: UserCheck },
    { path: "/admin/reports", label: "Reports", icon: TrendingUp },
  ];

  if (loading) return <div className="loading">Loading...</div>;
  if (!allowed) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <div style={{
        width: sidebarOpen ? "250px" : "70px",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          {sidebarOpen && <h3 style={{ margin: 0, color: "var(--text)" }}>Admin Panel</h3>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost">
            <Menu size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "1rem 0" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className="sidebar-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1.5rem",
                  color: isActive ? "white" : "var(--text)",
                  textDecoration: "none",
                  borderRadius: "12px",
                  margin: "0.25rem 1rem",
                  background: isActive ? "var(--primary)" : "transparent"
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
          <button onClick={logout} className="btn-ghost" style={{ width: "100%" }}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}