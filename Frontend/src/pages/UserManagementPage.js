import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { requireLogin } from "../auth";
import "./UserManagementPage.css";



export default function UserManagementPage() {
  requireLogin();

  const [role, setRole] = useState("all"); // all | user | driver | admin
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    role: "user",
    is_active: true,
  });

  const tabs = useMemo(
    () => [
      { key: "all", label: "Tất cả" },
      { key: "user", label: "User" },
      { key: "driver", label: "Driver" },
      { key: "admin", label: "Admin" },
    ],
    []
  );

  const loadUsers = async () => {
    setLoading(true);
    try {
      const qs = role === "all" ? "" : `?role=${role}`;
      const res = await api.get(`/admin/users${qs}`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      full_name: u.full_name || "",
      phone: u.phone || "",
      role: u.role || "user",
      is_active: u.is_active !== false,
    });
  };

  const save = async () => {
    await api.patch(`/admin/users/${editing._id}`, form);
    setEditing(null);
    loadUsers();
  };

  const resetPassword = async (u) => {
    const pwd = prompt(`Reset mật khẩu cho ${u.email}\nNhập mật khẩu mới:`);
    if (!pwd) return;
    await api.patch(`/admin/users/${u._id}/password`, { password: pwd });
    alert("Đã reset mật khẩu");
  };

  return (
     <div className="user-management-root">
     
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "18px 14px" }}>
      {/* CARD như ảnh */}
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Danh sách người dùng</h2>
            <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
              {loading ? "Đang tải..." : `Có ${users.length} tài khoản trong hệ thống.`}
            </div>
          </div>
        </div>

        {/* Chip filter giống ảnh */}
        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ color: "#334155", fontSize: 14 }}>Lọc theo vai trò:</div>

          {tabs.map((t) => {
            const active = role === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setRole(t.key)}
                style={{
                  borderRadius: 999,
                  padding: "8px 14px",
                  border: active ? "2px solid #2563eb" : "1px solid #dbeafe",
                  background: active ? "#eff6ff" : "#fff",
                  color: active ? "#1d4ed8" : "#334155",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TABLE như ảnh */}
        <div style={{ marginTop: 18, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={thStyle}>Họ tên</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>SĐT</th>
                <th style={thStyle}>Vai trò</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={{ ...thStyle, textAlign: "right" }}></th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={tdStyle}>{u.full_name || "-"}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.phone || "-"}</td>
                  <td style={tdStyle}>
                    <span style={pill(u.role)}>{u.role}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={pill(u.is_active !== false ? "active" : "locked")}>
                      {u.is_active !== false ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={() => openEdit(u)}
                        style={btnPrimary}
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => resetPassword(u)}
                        style={btnGray}
                      >
                        Reset MK
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && users.length === 0 && (
                <tr>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#64748b" }} colSpan={6}>
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal edit đơn giản */}
      {editing && (
        <div style={overlay}>
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Chỉnh sửa người dùng</h3>
              <button onClick={() => setEditing(null)} style={iconBtn}>✕</button>
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <label style={label}>
                Họ tên
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  style={input}
                />
              </label>

              <label style={label}>
                SĐT
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={input}
                />
              </label>

              <label style={label}>
                Vai trò
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={input}
                >
                  <option value="user">user</option>
                  <option value="driver">driver</option>
                </select>
              </label>

              <label style={{ ...label, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Tài khoản hoạt động (bỏ tick = khóa)
              </label>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button style={btnGray} onClick={() => setEditing(null)}>Hủy</button>
                <button style={btnPrimary} onClick={save}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

/* ===== styles nhỏ gọn ===== */
const thStyle = {
  textAlign: "left",
  padding: "14px 14px",
  fontSize: 13,
  color: "#475569",
  background: "#f1f5f9",
  borderTopLeftRadius: 12,
};

const tdStyle = {
  padding: "14px 14px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#0f172a",
};

const btnPrimary = {
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  padding: "9px 14px",
  borderRadius: 999,
  cursor: "pointer",
};

const btnGray = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#0f172a",
  fontWeight: 700,
  padding: "9px 14px",
  borderRadius: 999,
  cursor: "pointer",
};

const pill = (type) => {
  const base = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid #e2e8f0",
  };

  if (type === "admin") return { ...base, background: "#ecfeff", color: "#155e75", borderColor: "#a5f3fc" };
  if (type === "driver") return { ...base, background: "#fef9c3", color: "#854d0e", borderColor: "#fde68a" };
  if (type === "user") return { ...base, background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" };
  if (type === "active") return { ...base, background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" };
  if (type === "locked") return { ...base, background: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" };
  return base;
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 9999,
};

const modal = {
  width: "100%",
  maxWidth: 520,
  background: "#fff",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};

const label = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  color: "#334155",
  fontWeight: 700,
};

const input = {
  height: 40,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  padding: "0 12px",
  outline: "none",
  fontSize: 14,
};

const iconBtn = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 10,
  height: 36,
  width: 36,
  cursor: "pointer",
  fontWeight: 800,
};
