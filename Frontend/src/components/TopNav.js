import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { logout } from "../auth";
import "./TopNav.css";

export default function TopNav() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const menuRef = useRef(null);

  const token = localStorage.getItem("bus_token");

  useEffect(() => {
    // click outside -> đóng menu
    const onClickOutside = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpenUserMenu(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }
    (async () => {
      try {
        const res = await api.get("/auth/me");
        setMe(res.data);
      } catch {
        setMe(null);
      }
    })();
  }, [token]);

  const role = me?.role; // admin | driver | user
  const isAdmin = role === "admin";
  const isDriver = role === "driver";

  // Các mục quản lý sẽ nằm trong dropdown avatar
  const manageItems = useMemo(() => {
    const items = [];

    // driver: hiển thị khi driver hoặc admin
    if (isDriver || isAdmin) items.push({ to: "/driver", label: "Gửi tọa độ lên map" });

    // admin only
    if (isAdmin) {
      items.push({ to: "/admin", label: "Quản lý Xe" });
      items.push({ to: "/admin/users", label: "Chỉnh sửa người dùng" });
      items.push({ to: "/admin/users/create", label: "Thêm người dùng" });
    }

    return items;
  }, [isAdmin, isDriver]);

  return (
    <div className="topnav">
      <div className="topnav-left" onClick={() => navigate("/")}>
        <div className="brand-dot" />
        <div className="brand-text">SmartBus</div>
      </div>

      {/* CHỈ GIỮ Trang chủ + Bản đồ */}
      <div className="topnav-center">
        <NavLink to="/" className="nav-link">
          Trang chủ
        </NavLink>
        <NavLink to="/map" className="nav-link">
          Bản đồ
        </NavLink>
      </div>

      <div className="topnav-right">
        {!token ? (
          <NavLink to="/login" className="nav-link">
            Đăng nhập
          </NavLink>
        ) : (
          <div className="user-menu" ref={menuRef}>
            {/* CLICK AVATAR -> OPEN */}
            <button
              type="button"
              className="user-badge-btn"
              onClick={() => setOpenUserMenu((v) => !v)}
            >
              <div className="avatar">{(me?.full_name || "A")[0]}</div>
              <div className="user-name">{me?.full_name || "Admin"}</div>
            </button>

            {openUserMenu && (
              <div className="user-dropdown">
                <button
                  className="user-dropdown-item"
                  onClick={() => {
                    setOpenUserMenu(false);
                    navigate("/profile");
                  }}
                >
                  Hồ sơ
                </button>

                {/* Các mục quản lý theo role */}
                {manageItems.length > 0 && <div className="user-divider" />}
                {manageItems.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    className="user-dropdown-item link"
                    onClick={() => setOpenUserMenu(false)}
                  >
                    {it.label}
                  </NavLink>
                ))}

                <div className="user-divider" />

                <button
                  className="user-dropdown-item danger"
                  onClick={() => {
                    setOpenUserMenu(false);
                    logout();
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
