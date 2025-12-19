import React, { useEffect, useState } from "react";
import { api } from "../api";  
import { requireLogin } from "../auth"; 
import { useNavigate } from "react-router-dom";      // axios instance
import "./AdminPage.css";           


export default function AdminPage() {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    plate: "",
    driver_name: "",
    driver_phone: "",
    route_code: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success | error
  const [filterRoute, setFilterRoute] = useState("all");

  useEffect(() => {
    requireLogin(navigate); 
    loadRoutes();
    loadBuses();
  }, []);

  const loadRoutes = async () => {
    try {
      const res = await api.get("/routes");
      setRoutes(res.data);
    } catch (err) {
      console.error("loadRoutes error:", err);
    }
  };

  const loadBuses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/buses");
      setBuses(res.data);
    } catch (err) {
      console.error("loadBuses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    if (!form.plate || !form.route_code) {
      showMessage("Vui lòng nhập biển số và chọn tuyến!", "error");
      return;
    }

    try {
      setSaving(true);
      await api.post("/buses", form);
      showMessage("Thêm xe thành công!", "success");
      setForm({
        plate: "",
        driver_name: "",
        driver_phone: "",
        route_code: "",
      });
      await loadBuses();
    } catch (err) {
      console.error("addBus error:", err);
      showMessage("Không thể thêm xe. Kiểm tra server!", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBus = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa xe này?")) return;
    try {
      await api.delete(`/buses/${id}`);
      showMessage("Đã xóa xe.", "success");
      await loadBuses();
    } catch (err) {
      console.error("deleteBus error:", err);
      showMessage("Xóa xe thất bại!", "error");
    }
  };

  // lọc theo tuyến đang chọn
  const filteredBuses =
    filterRoute === "all"
      ? buses
      : buses.filter((b) => b.route?.code === filterRoute);

  return (
    <div className="admin-root">
      <div className="admin-wrapper">
        {/* HEADER */}
        <header className="admin-appbar">
          <div>
            <div className="admin-logo">SmartBus </div>
            <div className="admin-subtitle">Bảng điều khiển quản trị viên</div>
          </div>
          <div className="admin-chip">
            <span className="admin-chip-dot" />
            Quản trị viên
          </div>
        </header>

        {/* GREETING CARD */}
        <section className="admin-greeting-card">
          <div>
            <div className="admin-greeting-title">Chào buổi tối 👋</div>
            <div className="admin-greeting-text">
              Chúc bạn làm việc hiệu quả. Bạn có thể quản lý tuyến, thêm xe,
              theo dõi tài xế…
            </div>
          </div>
          <div className="admin-greeting-pill">
            Quản lý xe buýt Đà Nẵng
          </div>
        </section>

        <main className="admin-maingrid">
          {/* FORM THÊM XE */}
          <section className="admin-column">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <div className="admin-card-title">Thêm xe mới</div>
                  <div className="admin-card-sub">
                    Điền thông tin xe và gán vào tuyến hiện có.
                  </div>
                </div>
              </div>

              <form className="admin-form" onSubmit={handleAddBus}>
                <label className="admin-field">
                  <span>Biển số xe</span>
                  <input
                    type="text"
                    placeholder="VD: 43A-12345"
                    value={form.plate}
                    onChange={(e) => handleChange("plate", e.target.value)}
                  />
                </label>

                <label className="admin-field">
                  <span>Tên tài xế</span>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={form.driver_name}
                    onChange={(e) =>
                      handleChange("driver_name", e.target.value)
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Số điện thoại</span>
                  <input
                    type="text"
                    placeholder="0905xxxxxx"
                    value={form.driver_phone}
                    onChange={(e) =>
                      handleChange("driver_phone", e.target.value)
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Tuyến (code)</span>
                  <select
                    value={form.route_code}
                    onChange={(e) =>
                      handleChange("route_code", e.target.value)
                    }
                  >
                    <option value="">-- Chọn tuyến --</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.code}>
                        {r.code} – {r.start_point} → {r.end_point}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Thêm xe"}
                </button>

                {message && (
                  <div
                    className={
                      messageType === "success"
                        ? "admin-alert success"
                        : "admin-alert error"
                    }
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>
          </section>

          {/* DANH SÁCH XE */}
          <section className="admin-column">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <div className="admin-card-title">Danh sách xe buýt</div>
                  <div className="admin-card-sub">
                    {loading
                      ? "Đang tải dữ liệu..."
                      : `Có ${buses.length} xe trong hệ thống.`}
                  </div>
                </div>
              </div>

              {/* Filter tuyến */}
              <div className="admin-filter-row">
                <span className="admin-filter-label">Lọc theo tuyến:</span>
                <button
                  type="button"
                  className={
                    filterRoute === "all"
                      ? "admin-chip-filter active"
                      : "admin-chip-filter"
                  }
                  onClick={() => setFilterRoute("all")}
                >
                  Tất cả
                </button>
                {routes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={
                      filterRoute === r.code
                        ? "admin-chip-filter active"
                        : "admin-chip-filter"
                    }
                    onClick={() => setFilterRoute(r.code)}
                  >
                    {r.code}
                  </button>
                ))}
              </div>

              <div className="admin-table-wrapper">
                {loading ? (
                  <div className="admin-empty">Đang tải dữ liệu...</div>
                ) : filteredBuses.length === 0 ? (
                  <div className="admin-empty">
                    Chưa có xe nào phù hợp bộ lọc.
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Biển số</th>
                        <th>Tuyến</th>
                        <th>Tài xế</th>
                        <th>SĐT</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBuses.map((b) => (
                        <tr key={b.id || b._id}>
                          <td>{b.plate}</td>
                          <td>{b.route?.code || "(chưa có tuyến)"}</td>
                          <td>{b.driver_name || "-"}</td>
                          <td>{b.driver_phone || "-"}</td>
                          <td className="admin-actions-cell">
                            <button
                              type="button"
                              className="admin-btn-danger"
                              onClick={() => handleDeleteBus(b.id || b._id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
