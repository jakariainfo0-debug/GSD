import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router";
import Login from "./components/Login";
import OrderFrom from "./components/OrderFrom";
import AllOrder from "./components/AllOrder";
import Layout from "./components/Layout";

// 🔒 Protected Route
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const loggedIn = localStorage.getItem("loggedIn");

  if (!token || loggedIn !== "true") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    // 🔐 Protected routes with Layout
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/order",
            element: <OrderFrom />,
          },
          {
            path: "/all-orders",
            element: <AllOrder />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;