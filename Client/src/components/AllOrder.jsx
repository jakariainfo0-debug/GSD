import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

const API = `${import.meta.env.VITE_BACKEND_API}/api/orders`;

const AllOrder = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);

  // ---------- Load orders from API ----------
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert("⛔ সেশন শেষ, আবার লগইন করুন");
        localStorage.clear();
        navigate("/");
      } else {
        alert(err.response?.data?.message || "ডেটা লোড করা যায়নি!");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- Delete order ----------
  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি এই অর্ডারটি ডিলিট করতে চান?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
        setSelectedOrder(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "ডিলিট করা যায়নি!");
    }
  };

  // ---------- Update order ----------
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const updatedProducts = editOrder.products
        .filter((p) => Number(p.quantity) > 0)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          quantity: Number(p.quantity),
          subtotal: Number(p.price) * Number(p.quantity),
        }));

      if (updatedProducts.length === 0) {
        alert("⚠️ অন্তত একটি পণ্য থাকতে হবে!");
        return;
      }

      const newTotalItems = updatedProducts.reduce(
        (sum, p) => sum + p.quantity,
        0
      );

      const newTotalAmount = updatedProducts.reduce(
        (sum, p) => sum + p.subtotal,
        0
      );

      const res = await axios.put(
        `${API}/${editOrder._id}`,
        {
          shopName: editOrder.shopName,
          shopMobile: editOrder.shopMobile,
          shopAddress: editOrder.shopAddress,
          mapLink: editOrder.mapLink,
          orderDate: editOrder.orderDate,
          deliveryDate: editOrder.deliveryDate,
          products: updatedProducts,
          totalItems: newTotalItems,
          totalAmount: newTotalAmount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === editOrder._id ? res.data.order : o))
        );
        setEditOrder(null);
        alert("✅ আপডেট সফল হয়েছে!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "আপডেট করা যায়নি!");
    }
  };

  // ---------- Search filter ----------
  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.shopName?.toLowerCase().includes(q) ||
      o.shopMobile?.toLowerCase().includes(q) ||
      o.shopAddress?.toLowerCase().includes(q)
    );
  });

  // ---------- Print single order ----------
  const handlePrint = (order) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");

    const rows = order.products
      .map(
        (p, i) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${i + 1}</td>
          <td style="padding:8px;border:1px solid #ddd;">${p.name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${p.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">৳${p.price}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">৳${p.subtotal}</td>
        </tr>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Order Memo - ${order.shopName}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, sans-serif;
              padding: 30px;
              color: #222;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #333;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .header h1 { margin: 0; font-size: 26px; }
            .header p { margin: 4px 0 0; color: #666; font-size: 13px; }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 20px;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .info-grid div { padding: 4px 0; }
            .info-grid b { color: #333; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 14px;
            }
            th {
              background: #f0f0f0;
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            th:nth-child(1), th:nth-child(3) { text-align: center; }
            th:nth-child(4), th:nth-child(5) { text-align: right; }
            .total-box {
              text-align: right;
              font-size: 16px;
              margin-top: 10px;
              padding: 12px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .total-box b { font-size: 20px; color: #15803d; }
            .footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              color: #555;
            }
            .footer div {
              border-top: 1px solid #999;
              padding-top: 6px;
              width: 180px;
              text-align: center;
            }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>গ্রোব সফট ড্রিংকস লিঃ</h1>
            <p>Order Memo / Invoice</p>
          </div>

          <div class="info-grid">
            <div><b>দোকানের নাম:</b> ${order.shopName}</div>
            <div><b>মোবাইল:</b> ${order.shopMobile}</div>
            <div><b>ঠিকানা:</b> ${order.shopAddress}</div>
            <div><b>অর্ডার তারিখ:</b> ${order.orderDate}</div>
            <div><b>ডেলিভারি তারিখ:</b> ${order.deliveryDate}</div>
            <div><b>ম্যাপ:</b> ${order.mapLink || "—"}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>পণ্যের নাম</th>
                <th>পরিমাণ</th>
                <th>দাম</th>
                <th>সাবটোটাল</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="total-box">
            মোট পণ্য: <b>${order.totalItems}</b> কার্টন &nbsp;|&nbsp;
            মোট মূল্য: <b>৳${order.totalAmount.toLocaleString("bn-BD")}</b>
          </div>

          <div class="footer">
            <div>গ্রাহকের স্বাক্ষর</div>
            <div>দোকানের স্বাক্ষর</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  // ---------- Loading UI ----------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-gray-600">
            অর্ডার লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24 sm:pb-6">
      <div className="mx-auto max-w-5xl px-3 pt-3 sm:px-6 sm:pt-6">
        {/* Header */}
        <div className="mb-3 flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-md sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex items-center justify-between gap-2 sm:block">
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-gray-800 sm:text-xl">
                📋 সব অর্ডার
              </h1>
              <p className="truncate text-[11px] text-gray-500 sm:text-sm">
                মোট {orders.length} টি অর্ডার
              </p>
            </div>
            {/* Mobile refresh icon */}
            <button
              onClick={loadOrders}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-base text-gray-700 transition hover:bg-gray-200 active:scale-95 sm:hidden"
              aria-label="refresh"
            >
              🔄
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadOrders}
              className="hidden rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 sm:block"
            >
              🔄 রিফ্রেশ
            </button>
            <button
              onClick={() => navigate("/order")}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 sm:flex-none sm:px-4 sm:py-2"
            >
              ➕ নতুন অর্ডার
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-3 rounded-2xl bg-white p-3 shadow-md sm:mb-4 sm:p-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 নাম, মোবাইল বা ঠিকানা..."
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-4 sm:py-3"
          />
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-md sm:p-10">
            <div className="mb-3 text-5xl">📭</div>
            <h3 className="text-base font-bold text-gray-700 sm:text-lg">
              {orders.length === 0
                ? "এখনো কোনো অর্ডার নেই"
                : "কোনো অর্ডার খুঁজে পাওয়া যায়নি"}
            </h3>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {orders.length === 0
                ? "প্রথম অর্ডার তৈরি করতে নিচের বাটনে ক্লিক করুন"
                : "অন্য কিছু দিয়ে খুঁজে দেখুন"}
            </p>
            {orders.length === 0 && (
              <button
                onClick={() => navigate("/order")}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                ➕ নতুন অর্ডার তৈরি করুন
              </button>
            )}
          </div>
        )}

        {/* Orders list */}
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl bg-white p-3 shadow-md transition hover:shadow-lg sm:p-4"
            >
              {/* Top: Shop Info */}
              <div className="flex items-start gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg sm:h-11 sm:w-11">
                  🏪
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-gray-800 sm:text-base">
                    {order.shopName}
                  </h3>
                  <p className="truncate text-[11px] text-gray-500 sm:text-xs">
                    📞 {order.shopMobile}
                  </p>
                </div>
                {/* Amount Badge (mobile prominent) */}
                <div className="shrink-0 rounded-lg bg-green-50 px-2 py-1 text-right sm:px-3 sm:py-1.5">
                  <p className="text-[9px] text-gray-500 sm:text-[10px]">
                    মোট
                  </p>
                  <p className="text-xs font-bold text-green-600 sm:text-sm">
                    ৳{order.totalAmount.toLocaleString("bn-BD")}
                  </p>
                </div>
              </div>

              {/* Info grid */}
              <div className="mt-3 grid grid-cols-1 gap-1 rounded-lg bg-gray-50 p-2.5 text-[11px] text-gray-600 sm:grid-cols-2 sm:text-xs">
                <p className="truncate">📍 {order.shopAddress}</p>
                <p>📅 অর্ডার: {order.orderDate}</p>
                <p>🚚 ডেলিভারি: {order.deliveryDate}</p>
                <p>
                  📦 {order.totalItems} কার্টন
                </p>
              </div>

              {/* Items preview */}
              <div className="mt-2.5">
                <p className="mb-1 text-[10px] font-semibold text-gray-500 sm:text-xs">
                  আইটেম:
                </p>
                <div className="flex flex-wrap gap-1">
                  {order.products.map((p, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-700 sm:text-xs"
                    >
                      {p.name} × {p.quantity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions - Grid on mobile, column on desktop */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="rounded-lg bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 active:scale-95"
                >
                  👁️ বিস্তারিত
                </button>
                <button
                  onClick={() =>
                    setEditOrder(JSON.parse(JSON.stringify(order)))
                  }
                  className="rounded-lg bg-yellow-100 px-3 py-2.5 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-200 active:scale-95"
                >
                  ✏️ এডিট
                </button>
                <button
                  onClick={() => handlePrint(order)}
                  className="rounded-lg bg-green-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 active:scale-95"
                >
                  🖨️ প্রিন্ট
                </button>
                <button
                  onClick={() => handleDelete(order._id)}
                  className="rounded-lg bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:scale-95"
                >
                  🗑️ ডিলিট
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Detail Modal ---------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-5">
            {/* Drag handle for mobile */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300 sm:hidden" />

            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-800 sm:text-lg">
                🧾 অর্ডার বিস্তারিত
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <b>দোকান:</b> {selectedOrder.shopName}
              </p>
              <p>
                <b>মোবাইল:</b> {selectedOrder.shopMobile}
              </p>
              <p>
                <b>ঠিকানা:</b> {selectedOrder.shopAddress}
              </p>
              {selectedOrder.mapLink && (
                <p>
                  <b>ম্যাপ:</b>{" "}
                  <a
                    href={selectedOrder.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    লিংক দেখুন
                  </a>
                </p>
              )}
              <p>
                <b>অর্ডার তারিখ:</b> {selectedOrder.orderDate}
              </p>
              <p>
                <b>ডেলিভারি তারিখ:</b> {selectedOrder.deliveryDate}
              </p>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-gray-700">
                পণ্যের তালিকা:
              </p>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left sm:px-3">পণ্য</th>
                      <th className="px-2 py-2 text-center sm:px-3">Qty</th>
                      <th className="px-2 py-2 text-right sm:px-3">
                        সাবটোটাল
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-2 sm:px-3">{p.name}</td>
                        <td className="px-2 py-2 text-center sm:px-3">
                          {p.quantity}
                        </td>
                        <td className="px-2 py-2 text-right sm:px-3">
                          ৳{p.subtotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-green-50 p-3 sm:p-4">
              <div className="flex items-center justify-between text-sm">
                <span>মোট পণ্য:</span>
                <b>{selectedOrder.totalItems} কার্টন</b>
              </div>
              <div className="mt-1 flex items-center justify-between text-base">
                <span>মোট মূল্য:</span>
                <b className="text-green-600">
                  ৳{selectedOrder.totalAmount.toLocaleString("bn-BD")}
                </b>
              </div>
            </div>

            <div className="mt-4 flex gap-2 sm:mt-5">
              <button
                onClick={() => handlePrint(selectedOrder)}
                className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-700 active:scale-95"
              >
                🖨️ প্রিন্ট
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200 active:scale-95"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Edit Modal ---------- */}
      {editOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-5">
            {/* Drag handle */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300 sm:hidden" />

            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-800 sm:text-lg">
                ✏️ অর্ডার এডিট
              </h3>
              <button
                onClick={() => setEditOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Shop Info */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm">
                  দোকানের নাম
                </label>
                <input
                  type="text"
                  value={editOrder.shopName}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, shopName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm">
                    মোবাইল
                  </label>
                  <input
                    type="text"
                    value={editOrder.shopMobile}
                    onChange={(e) =>
                      setEditOrder({
                        ...editOrder,
                        shopMobile: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm">
                    ম্যাপ লিংক
                  </label>
                  <input
                    type="text"
                    value={editOrder.mapLink || ""}
                    onChange={(e) =>
                      setEditOrder({ ...editOrder, mapLink: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm">
                  ঠিকানা
                </label>
                <input
                  type="text"
                  value={editOrder.shopAddress}
                  onChange={(e) =>
                    setEditOrder({
                      ...editOrder,
                      shopAddress: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm">
                    অর্ডার তারিখ
                  </label>
                  <input
                    type="date"
                    value={editOrder.orderDate}
                    onChange={(e) =>
                      setEditOrder({
                        ...editOrder,
                        orderDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm">
                    ডেলিভারি তারিখ
                  </label>
                  <input
                    type="date"
                    value={editOrder.deliveryDate}
                    onChange={(e) =>
                      setEditOrder({
                        ...editOrder,
                        deliveryDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Products Edit */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:mt-5 sm:p-4">
              <div className="mb-3 flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold text-gray-700 sm:text-sm">
                  📦 পণ্যের তালিকা
                </h4>
                <span className="rounded-lg bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700 sm:px-3 sm:text-xs">
                  মোট:{" "}
                  {editOrder.products.reduce(
                    (sum, p) => sum + Number(p.quantity || 0),
                    0
                  )}{" "}
                  কার্টন
                </span>
              </div>

              <div className="space-y-2">
                {editOrder.products.map((product, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-white p-2.5 sm:p-3"
                  >
                    {/* Product name */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 sm:h-8 sm:w-8 sm:text-xs">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="truncate text-xs font-semibold text-gray-800 sm:text-sm">
                          {product.name}
                        </h5>
                        <p className="text-[10px] text-gray-500 sm:text-xs">
                          ৳{product.price} / কার্টন
                        </p>
                      </div>
                    </div>

                    {/* Qty + Subtotal - stacked on mobile */}
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed pt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...editOrder.products];
                            const current = Number(
                              updated[index].quantity || 0
                            );
                            const next = current > 0 ? current - 1 : 0;
                            updated[index] = {
                              ...updated[index],
                              quantity: String(next),
                              subtotal:
                                next * Number(updated[index].price),
                            };
                            setEditOrder({
                              ...editOrder,
                              products: updated,
                            });
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-base font-bold text-gray-600 transition hover:bg-gray-100 active:scale-95"
                        >
                          −
                        </button>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={product.quantity}
                          onChange={(e) => {
                            const clean = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                            const updated = [...editOrder.products];
                            updated[index] = {
                              ...updated[index],
                              quantity: clean,
                              subtotal:
                                Number(clean || 0) *
                                Number(product.price),
                            };
                            setEditOrder({
                              ...editOrder,
                              products: updated,
                            });
                          }}
                          className="w-12 rounded-lg border border-gray-300 bg-white px-1 py-1.5 text-center text-sm font-bold outline-none focus:border-blue-500 sm:w-16"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...editOrder.products];
                            const current = Number(
                              updated[index].quantity || 0
                            );
                            const next = current + 1;
                            updated[index] = {
                              ...updated[index],
                              quantity: String(next),
                              subtotal:
                                next * Number(updated[index].price),
                            };
                            setEditOrder({
                              ...editOrder,
                              products: updated,
                            });
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-base font-bold text-gray-600 transition hover:bg-gray-100 active:scale-95"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] text-gray-500 sm:text-[10px]">
                          সাবটোটাল
                        </p>
                        <p className="text-xs font-bold text-green-600 sm:text-sm">
                          ৳
                          {(
                            Number(product.quantity || 0) *
                            Number(product.price)
                          ).toLocaleString("bn-BD")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Total */}
              <div className="mt-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-3">
                <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-600">মোট: </span>
                    <b className="text-gray-800">
                      {editOrder.products.reduce(
                        (sum, p) => sum + Number(p.quantity || 0),
                        0
                      )}{" "}
                      কার্টন
                    </b>
                  </div>
                  <div className="text-right">
                    <b className="text-base text-green-600 sm:text-lg">
                      ৳
                      {editOrder.products
                        .reduce(
                          (sum, p) =>
                            sum +
                            Number(p.quantity || 0) * Number(p.price),
                          0
                        )
                        .toLocaleString("bn-BD")}
                    </b>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2 sm:mt-5">
              <button
                onClick={handleUpdate}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                💾 সেভ করুন
              </button>
              <button
                onClick={() => setEditOrder(null)}
                className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200 active:scale-95"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrder;