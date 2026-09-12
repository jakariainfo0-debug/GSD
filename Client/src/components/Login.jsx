import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/api/auth/login`
        ,
        { email, password }
      );

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("loggedIn", "true");
        navigate("/order");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "সার্ভারে সমস্যা হয়েছে!";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      {/* Main container */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-md">
          {/* Logo + Title */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xl sm:h-20 sm:w-20 sm:rounded-3xl">
              <span className="text-3xl sm:text-4xl">🏪</span>
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              অর্ডার ম্যানেজার
            </h1>
            <p className="mt-1 text-xs text-blue-100 sm:text-sm">
              দোকানের অর্ডার ম্যানেজ করতে লগইন করুন
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-8">
            {/* Form Header */}
            <div className="mb-5 text-center sm:mb-6">
              <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
                লগইন করুন
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                আপনার একাউন্টে প্রবেশ করুন
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 sm:text-sm">
                <span className="text-base leading-none">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  📧 ইমেইল
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  placeholder="admin@mail.com"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  🔒 পাসওয়ার্ড
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-500 transition hover:bg-gray-100 active:scale-95"
                    aria-label="toggle password"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    লগইন হচ্ছে...
                  </span>
                ) : (
                  "🔓 লগইন করুন"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;