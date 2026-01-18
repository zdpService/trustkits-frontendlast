import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  Users,
  MessageSquare,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ArrowRightLeft,
} from "lucide-react";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    {
      path: "/admin/users",
      icon: <Users size={20} />,
      label: "Utilisateurs",
    },
    {
      path: "/admin/transfers",
      icon: <ArrowRightLeft size={20} />,
      label: "Virements",
    },
    {
      path: "/admin/messages",
      icon: <MessageSquare size={20} />,
      label: "Messages",
    },
  ];

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  return (
    <div className="admin-container">
      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}
      >
        {/* LOGO AREA */}
        <div className="admin-logo">
          <div className="logo-flex">
            <ShieldCheck size={28} color="#4F46E5" />
            <span>AdminPanel</span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* USER INFO & LOGOUT */}
        <div className="admin-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">A</div>
            <div className="admin-details">
              <span className="name">Admin</span>
              <span className="role">Super User</span>
            </div>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="main-wrapper">
        {/* HEADER MOBILE */}
        <div className="mobile-header">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="burger-btn"
          >
            <Menu size={24} />
          </button>
          <span className="mobile-title">Administration</span>
        </div>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
