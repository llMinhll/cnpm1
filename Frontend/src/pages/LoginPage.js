import React, { useState } from "react";
import { api } from "../api";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });

      // Lưu token
      localStorage.setItem("bus_token", res.data.token);

   // Chuyển đến trang map   
    navigate("/map");
   //  reload toàn bộ trang
    window.location.reload();
    } catch (err) {
      console.error("Login error:", err);
      setError("Sai email hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-box">

        <h2 className="login-title">Đăng nhập Admin</h2>
        <p className="login-sub">SmartBus </p>

        <form onSubmit={handleLogin} className="login-form">

          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="admin@smartbus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="login-field">
            <span>Mật khẩu</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

        </form>
      </div>
    </div>
  );
}
