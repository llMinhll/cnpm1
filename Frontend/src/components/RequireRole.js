import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api";

// roles: ["admin"] hoặc ["admin","driver"]
export default function RequireRole({ roles = [], children }) {
  const token = localStorage.getItem("bus_token");
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api.get("/auth/me");
        setMe(res.data);
      } catch (e) {
        // token lỗi/expired
        localStorage.removeItem("bus_token");
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // chưa login
  if (!token) return <Navigate to="/login" replace />;

  // đang load user
  if (loading) return null; // hoặc spinner

  // không lấy được me => về login
  if (!me) return <Navigate to="/login" replace />;

  // không đủ quyền
  if (roles.length && !roles.includes(me.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
