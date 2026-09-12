import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 👤 User info
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🔄 Route change হলে mobile menu বন্ধ
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // 🚪 Logout
  const handleLogout = () => {
    if (!window.confirm("আপনি কি লগআউট করতে চান?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    navigate("/");
  };

  // 🎨 Menu Items
  const menuItems = [
    {
      name: "নতুন অর্ডার",
      path: "/order",
      icon: "🧾",
    },
    {
      name: "সব অর্ডার",
      path: "/all-orders",
      icon: "📋",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ========== Top Navbar ========== */}
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg shadow-md sm:h-10 sm:w-10 sm:text-xl">
              🏪
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-gray-800 sm:text-base">
                অর্ডার ম্যানেজার
              </h1>
              <p className="hidden text-[10px] text-gray-500 sm:block">
                গ্রোব সফট ড্রিংকস লিঃ
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-1 md:flex">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Right side: User + Logout (desktop) / Hamburger (mobile) */}
          <div className="flex items-center gap-2">
            {/* User email (desktop only) */}
            <div className="hidden items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 md:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="max-w-[140px] truncate text-xs font-semibold text-gray-700">
                {user.email || "User"}
              </span>
            </div>

            {/* Logout (desktop) */}
            <button
              onClick={handleLogout}
              className="hidden rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 md:block"
            >
              🚪 লগআউট
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xl text-gray-700 transition hover:bg-gray-200 active:scale-95 md:hidden"
              aria-label="menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* ========== Mobile Menu Dropdown ========== */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white px-3 pb-3 shadow-md md:hidden">
            {/* User info */}
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-gray-800">
                  {user.email || "User"}
                </p>
                <p className="text-[10px] text-gray-500">লগইন করা আছে</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                  {location.pathname === item.path && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </NavLink>
              ))}

              {/* Logout (mobile) */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl bg-red-50 px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <span className="text-lg">🚪</span>
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ========== Page Content ========== */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;