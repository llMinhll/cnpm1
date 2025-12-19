import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("bus_token");
    if (!token) return navigate("/login");

    fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.email) setUser(data);
        else navigate("/login");
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (!user) return <div className="loading">Đang tải...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">

        <div className="profile-avatar">
          {user.full_name.charAt(0).toUpperCase()}
        </div>

        <h2 className="profile-name">{user.full_name}</h2>

        <p className="profile-role">
          Vai trò: <strong>{user.role}</strong>
        </p>

        <div className="profile-info">

          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Số điện thoại</span>
            <span className="info-value">{user.phone || "Chưa cập nhật"}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Ngày tạo</span>
            <span className="info-value">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Cập nhật lúc</span>
            <span className="info-value">
              {new Date(user.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">ID người dùng</span>
            <span className="info-value">{user.id}</span>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("bus_token");
            navigate("/login");
          }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
