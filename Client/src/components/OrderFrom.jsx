import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

// 🛒 Product list
const products = [
  { id: 1, name: "টাইগার ২৫০ মি.লি. (২৪ পিস)", price: 565 },
  { id: 2, name: "টাইগার ২৫০ মি.লি. (২৭ পিস)", price: 635 },
  { id: 3, name: "ফিজআপ ২৫০ মিলি (২৪ পিস)", price: 380 },
  { id: 4, name: "ফিজআপ (২৮ পিস)", price: 445 },
  { id: 5, name: "ইউরোকোলা ২৫০ মি.লি. (২৪ পিস)", price: 380 },
  { id: 6, name: "ইউরোকোলা (২৮ পিস)", price: 445 },
];

const OrderFrom = () => {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    shopName: "",
    shopMobile: "",
    shopAddress: "",
    mapLink: "",
    orderDate: today,
    deliveryDate: today,
    products: {},
  });

  const [loading, setLoading] = useState(false);

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProductChange = (productId, value) => {
    const clean = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      products: { ...prev.products, [productId]: clean },
    }));
  };

  // ---------- Totals ----------
  const totalItems = products.reduce((sum, p) => {
    return sum + Number(formData.products[p.id] || 0);
  }, 0);

  const totalAmount = products.reduce((sum, p) => {
    const qty = Number(formData.products[p.id] || 0);
    return sum + qty * p.price;
  }, 0);

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalItems === 0) {
      alert("⚠️ অন্তত একটি পণ্য সিলেক্ট করুন!");
      return;
    }

    const selectedProducts = products
      .filter((p) => Number(formData.products[p.id] || 0) > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: Number(formData.products[p.id]),
        subtotal: Number(formData.products[p.id]) * p.price,
      }));

    const orderData = {
      shopName: formData.shopName,
      shopMobile: formData.shopMobile,
      shopAddress: formData.shopAddress,
      mapLink: formData.mapLink,
      orderDate: formData.orderDate,
      deliveryDate: formData.deliveryDate,
      products: selectedProducts,
      totalItems,
      totalAmount,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/api/orders`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("✅ অর্ডার সফলভাবে সেভ হয়েছে!");
        navigate("/all-orders");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert("⛔ সেশন শেষ, আবার লগইন করুন");
        localStorage.clear();
        navigate("/");
      } else {
        alert(err.response?.data?.message || "সার্ভারে সমস্যা হয়েছে!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24 sm:pb-6">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl px-3 pt-3 sm:px-6 sm:pt-6"
      >
        {/* ---------- Header ---------- */}
        <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-white p-3 shadow-md sm:mb-4 sm:p-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-gray-800 sm:text-xl">
              🧾 নতুন অর্ডার
            </h1>
            <p className="truncate text-[11px] text-gray-500 sm:text-sm">
              দোকানের তথ্য ও পণ্য দিন
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/all-orders")}
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95 sm:px-4 sm:text-sm"
          >
            📋 <span className="hidden sm:inline">সব অর্ডার</span>
            <span className="sm:hidden">অর্ডার</span>
          </button>
        </div>

        {/* ---------- Shop Info ---------- */}
        <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6 md:p-7">
          <h2 className="mb-3 border-b pb-2 text-sm font-bold text-gray-800 sm:mb-4 sm:text-base">
            🏪 দোকানের তথ্য
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2">
            {/* Shop Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
                দোকানের নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="shopName"
                value={formData.shopName}
                onChange={handleChange}
                required
                placeholder="উদা: ভাই ভাই স্টোর"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-4 sm:py-3"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
                মোবাইল নাম্বার <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="shopMobile"
                value={formData.shopMobile}
                onChange={handleChange}
                required
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-4 sm:py-3"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
                দোকানের ঠিকানা / লোকেশন{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="shopAddress"
                value={formData.shopAddress}
                onChange={handleChange}
                required
                placeholder="উদা: দক্ষিণখান, ঢাকা"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-4 sm:py-3"
              />
            </div>

            {/* Google Map */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
                📍 গুগল ম্যাপস লিংক
              </label>
              <input
                type="url"
                id="mapLink"
                value={formData.mapLink}
                onChange={handleChange}
                inputMode="url"
                placeholder="https://maps.google.com/..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-4 sm:py-3"
              />
            </div>

            {/* Order Date */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
                📅 অর্ডার তারিখ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="orderDate"
                value={formData.orderDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-4 sm:py-3"
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
                🚚 ডেলিভারি তারিখ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-4 sm:py-3"
              />
            </div>
          </div>
        </div>

        {/* ---------- Products ---------- */}
        <div className="mt-3 rounded-2xl bg-white p-4 shadow-md sm:mt-6 sm:p-6 md:p-7">
          {/* Section Header */}
          <div className="mb-4 flex items-center justify-between gap-2 border-b pb-3 sm:mb-6 sm:pb-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-lg sm:h-10 sm:w-10 sm:text-xl">
                📦
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-gray-800 sm:text-lg">
                  আইটেম সিলেক্ট করুন
                </h2>
                <p className="truncate text-[11px] text-gray-500 sm:text-sm">
                  প্রয়োজন অনুযায়ী পরিমাণ দিন
                </p>
              </div>
            </div>
            <div className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 sm:px-4 sm:py-2 sm:text-sm">
              {totalItems} কার্টন
            </div>
          </div>

          {/* Product Cards */}
          <div className="space-y-2.5 sm:space-y-3">
            {products.map((product, index) => {
              const quantity = formData.products[product.id] || 0;
              const subtotal = quantity * product.price;

              return (
                <div
                  key={product.id}
                  className={`rounded-xl border p-3 transition sm:p-4 ${quantity > 0
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                    }`}
                >
                  {/* Top: index + name + price */}
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-500 shadow-sm sm:h-9 sm:w-9 sm:text-sm">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold leading-tight text-gray-800 sm:text-base">
                        {product.name}
                      </h3>
                      <p className="mt-0.5 text-xs sm:mt-1 sm:text-sm">
                        <span className="font-bold text-green-600">
                          ৳{product.price}
                        </span>
                        <span className="ml-1 text-gray-500">/ কার্টন</span>
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Qty + Subtotal */}
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-gray-200 pt-3">
                    {/* Qty control */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(quantity || 0);
                          const next = current > 0 ? current - 1 : 0;
                          handleProductChange(product.id, String(next));
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-bold text-gray-600 transition hover:bg-gray-100 active:scale-95"
                        aria-label="decrease"
                      >
                        −
                      </button>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={quantity || ""}
                        onChange={(e) =>
                          handleProductChange(product.id, e.target.value)
                        }
                        placeholder="0"
                        className="w-14 rounded-lg border border-gray-300 bg-white px-2 py-2 text-center text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-20 sm:text-base"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(quantity || 0);
                          handleProductChange(product.id, String(current + 1));
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-bold text-gray-600 transition hover:bg-gray-100 active:scale-95"
                        aria-label="increase"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 sm:text-xs">
                        সাবটোটাল
                      </p>
                      <p className="text-sm font-bold text-green-600 sm:text-base">
                        ৳{subtotal.toLocaleString("bn-BD")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------- Total ---------- */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:mt-6 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-gray-600 sm:text-sm">
                  মোট পণ্য
                </p>
                <p className="text-lg font-bold text-gray-800 sm:text-xl">
                  {totalItems} কার্টন
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-600 sm:text-sm">
                  মোট মূল্য
                </p>
                <p className="text-xl font-bold text-green-600 sm:text-2xl">
                  ৳{totalAmount.toLocaleString("bn-BD")}
                </p>
              </div>
            </div>
          </div>

          {/* ---------- Submit ---------- */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6 sm:py-4 sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                সেভ হচ্ছে...
              </span>
            ) : (
              "📝 অর্ডার সাবমিট করুন"
            )}
          </button>
        </div>
      </form>

      {/* ---------- Sticky Mobile Bottom Bar (Total Quick View) ---------- */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-3 shadow-2xl sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-gray-500">মোট</p>
              <p className="text-sm font-bold text-gray-800">
                {totalItems} কার্টন
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500">মূল্য</p>
              <p className="text-base font-bold text-green-600">
                ৳{totalAmount.toLocaleString("bn-BD")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFrom;