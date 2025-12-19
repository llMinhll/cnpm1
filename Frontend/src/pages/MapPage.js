// src/pages/MapPage.js
import React, { useEffect, useState } from "react";
import { api, API_BASE } from "../api";
import BusMap from "../components/BusMapOptimized";

function MapPage() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [searchText, setSearchText] = useState("");

  // load danh sách tuyến (giống loadRoutes trong JS thuần)
  const loadRoutes = async () => {
    try {
      const res = await api.get("/routes");
      if (!Array.isArray(res.data)) {
        console.error("API /routes không trả mảng:", res.data);
        return;
      }
      setRoutes(res.data);
    } catch (err) {
      console.error("loadRoutes error:", err);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  // chọn tuyến
  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
  };

  // lọc tuyến theo từ khoá
  const filteredRoutes = routes.filter((r) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    const code = (r.code || "").toLowerCase();
    const name = (r.name || "").toLowerCase();
    const start = (r.start_point || "").toLowerCase();
    const end = (r.end_point || "").toLowerCase();
    return (
      code.includes(q) ||
      name.includes(q) ||
      start.includes(q) ||
      end.includes(q)
    );
  });

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", gap: 16 }}>
      {/* Sidebar tuyến */}
      <div
        style={{
          width: 320,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          padding: 16,
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Tuyến xe buýt</h3>

        <input
          placeholder="Tìm tuyến..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            marginBottom: 12,
          }}
        />

        <div id="routeList">
          {filteredRoutes.map((r) => (
            <div
              key={r.id}
              className="route-card"
              style={{
                padding: 12,
                borderRadius: 12,
                border:
                  selectedRouteId === r.id
                    ? "2px solid #0d6efd"
                    : "1px solid #eee",
                marginBottom: 8,
                cursor: "pointer",
                background:
                  selectedRouteId === r.id ? "#e7f1ff" : "white",
              }}
              onClick={() => handleSelectRoute(r.id)}
            >
              <div style={{ fontWeight: 600 }}>
                Tuyến số {r.code || r.id}
              </div>
              <div style={{ fontSize: 13, color: "#555" }}>
                {(r.start_point || "") + " - " + (r.end_point || "")}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                {r.price != null
                  ? `${r.price.toLocaleString()} đ/lượt`
                  : "Giá cập nhật sau"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bản đồ */}
      <div style={{ flex: 1, position: "relative" }}>
        <BusMap selectedRouteId={selectedRouteId} />

        {/* Zoom + */}
        <button
          onClick={() => window.zoomMap && window.zoomMap(true)}
          style={{
            position: "absolute",
            bottom: 140,
            right: 20,
            zIndex: 1000,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "white",
            border: "none",
            boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
            fontSize: 26,
            cursor: "pointer",
          }}
        >
          +
        </button>

        {/* Zoom – */}
        <button
          onClick={() => window.zoomMap && window.zoomMap(false)}
          style={{
            position: "absolute",
            bottom: 80,
            right: 20,
            zIndex: 1000,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "white",
            border: "none",
            boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
            fontSize: 26,
            cursor: "pointer",
          }}
        >
          –
        </button>

        {/* Nút về Đà Nẵng */}
        <button
          onClick={() => window.recenterMap && window.recenterMap()}
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "white",
            border: "none",
            boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          ⦿
        </button>
      </div>
    </div>
  );
}

export default MapPage;
