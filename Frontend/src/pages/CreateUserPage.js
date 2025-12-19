import { useState } from "react";
import { api } from "../api";
import { requireLogin } from "../auth";
import "./UserManagementPage.css";

export default function CreateUserPage() {
  requireLogin();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "driver",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) {
      alert("Email và mật khẩu là bắt buộc");
      return;
    }
    if (!form.full_name.trim()) {
        alert("Vui lòng nhập họ tên");
      return;
   }


    try {
      setLoading(true);
      await api.post("/admin/users", form);
      alert(" Tạo tài khoản thành công");

      setForm({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        role: "driver",
        is_active: true,
      });
    } catch (e) {
      console.log("Create user error:", e?.response?.status, e?.response?.data, e);
       alert(
         (e?.response?.data?.message || e?.response?.data?.error || "Không thể tạo tài khoản")
         + ` (status: ${e?.response?.status || "?"})`
       );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-management-root">
      <div className="page-container">
        <div className="card create-user-card">
          <h2>Thêm User / Driver</h2>
          <p>Tạo tài khoản mới cho người dùng hoặc tài xế.</p>

          <div className="create-user-form">
            {/* Họ tên */}
            <div>
              <label className="form-label">Họ tên</label>
              <input
                className="input"
                placeholder="Nguyễn Văn A"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email</label>
              <input
                className="input"
                placeholder="email@gmail.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="form-label">Số điện thoại</label>
              <input
                className="input"
                placeholder="09xxxxxxxx"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            {/* Vai trò */}
            <div>
              <label className="form-label">Vai trò</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            {/* Action */}
            <div className="create-user-actions">
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
