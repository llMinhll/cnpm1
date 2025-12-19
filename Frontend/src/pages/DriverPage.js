import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api, API_BASE } from "../api";

const SOCKET_URL = API_BASE.replace("/api", ""); // http://localhost:3000

export default function DriverPage() {
  const [buses, setBuses] = useState([]);
  const [busId, setBusId] = useState("");
  const [status, setStatus] = useState("Chưa chạy");
  const [pos, setPos] = useState(null);
  const [err, setErr] = useState("");

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentAtRef = useRef(0);

  // Load danh sách xe để tài xế chọn
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/buses");
        setBuses(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setErr("Không tải được danh sách xe.");
      }
    })();
  }, []);

  // Kết nối socket 1 lần
  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = s;

    s.on("connect", () => setStatus("Socket: Đã kết nối"));
    s.on("disconnect", () => setStatus("Socket: Mất kết nối"));

    return () => {
      try {
        s.close();
      } catch {}
    };
  }, []);

  const stop = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus("Đã dừng gửi GPS");
  };

  const start = async () => {
    setErr("");
    if (!busId) {
      setErr("Vui lòng chọn xe trước khi bắt đầu.");
      return;
    }
    if (!navigator.geolocation) {
      setErr("Trình duyệt không hỗ trợ Geolocation.");
      return;
    }

    // iOS/Safari thường cần HTTPS hoặc localhost + user gesture
    setStatus("Đang xin quyền GPS...");

    // Watch realtime
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        const speed = p.coords.speed != null ? Math.round(p.coords.speed * 3.6) : 0; // m/s -> km/h

        const now = Date.now();
        // throttle 1s/lần (tránh spam quá dày)
        if (now - lastSentAtRef.current < 1000) return;
        lastSentAtRef.current = now;
        setPos({ lat, lng, speed });
        const s = socketRef.current;
        if (s && s.connected) {
          s.emit("bus_position", { bus_id: busId, lat, lng, speed });
          setStatus("Đang gửi GPS...");
        } else {
          setStatus("Socket chưa kết nối");
        }
      },
      (e) => {
        setErr("Không lấy được GPS: " + (e.message || "Unknown"));
        setStatus("Lỗi GPS");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Driver Mode</h2>
        <p>Chọn xe và bấm Bắt đầu để gửi GPS realtime lên server.</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            className="input"
            style={{ minWidth: 260 }}
          >
            <option value="">-- Chọn xe --</option>
            {buses.map((b) => (
              <option key={b.id || b._id} value={b.id || b._id}>
                {b.plate} ({b.route?.code || "no-route"})
              </option>
            ))}
          </select>

          <button className="btn" onClick={start}>
            Bắt đầu
          </button>
          <button className="btn" style={{ background: "#ff4d4d" }} onClick={stop}>
            Dừng
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 14 }}>
          <b>Trạng thái:</b> {status}
        </div>

        {pos && (
          <div style={{ marginTop: 12, fontSize: 14 }}>
            <b>Lat:</b> {pos.lat.toFixed(6)} &nbsp; | &nbsp;
            <b>Lng:</b> {pos.lng.toFixed(6)} &nbsp; | &nbsp;
            {/* <b>Speed:</b> {pos.speed} km/h */}
          </div>
        )}

        {err && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#fee2e2", color: "#b91c1c" }}>
            {err}
          </div>
        )}
      </div>
    </div>
  );
}
