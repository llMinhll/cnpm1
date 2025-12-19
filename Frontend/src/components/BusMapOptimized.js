// src/components/BusMapOptimized.js
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE } from "../api";
import { io } from "socket.io-client";

const DEFAULT_CENTER = [16.047, 108.206]; // Đà Nẵng

// Icon xe buýt
const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/1068/1068631.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const BusMapOptimized = ({ selectedRouteId }) => {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const stopMarkersRef = useRef([]);
  const busMarkersRef = useRef({});
  const selectedRouteIdRef = useRef(null);

  // luôn giữ giá trị selectedRouteId mới nhất trong ref
  useEffect(() => {
    selectedRouteIdRef.current = selectedRouteId;
  }, [selectedRouteId]);

  // Hàm cập nhật marker xe buýt
  const updateBusMarkers = (buses, { replaceAll = false } = {}) => {
    const map = mapRef.current;
    if (!map || !Array.isArray(buses)) return;

    const routeFilter = selectedRouteIdRef.current;

    // lọc theo tuyến nếu có
    const visible = routeFilter
      ? buses.filter((b) => {
          if (!b.route_id) return false;
          return String(b.route_id) === String(routeFilter);
        })
      : buses;

    // nếu replaceAll = true → xoá những marker không còn trong danh sách
    if (replaceAll) {
      const activeIds = new Set(
        visible
          .filter((b) => b.id != null || b.bus_id != null)
          .map((b) => String(b.id ?? b.bus_id))
      );

      Object.keys(busMarkersRef.current).forEach((id) => {
        if (!activeIds.has(id)) {
          map.removeLayer(busMarkersRef.current[id]);
          delete busMarkersRef.current[id];
        }
      });
    }

    // tạo / cập nhật marker
    visible.forEach((bus) => {
      const id = String(bus.id ?? bus.bus_id);
      if (!bus.lat || !bus.lng) return;

      const popupHtml = `
        <b>${bus.plate || "Xe"}</b><br/>
        Tuyến: ${bus.route_code || bus.route_id || "-"}<br/>
        Tốc độ: ${bus.speed || 0} km/h
      `;

      if (!busMarkersRef.current[id]) {
        const m = L.marker([bus.lat, bus.lng], { icon: busIcon }).addTo(map);
        m.bindPopup(popupHtml);
        busMarkersRef.current[id] = m;
      } else {
        busMarkersRef.current[id].setLatLng([bus.lat, bus.lng]);
        busMarkersRef.current[id].setPopupContent(popupHtml);
      }
    });
  };

  // Khởi tạo map (chỉ 1 lần)
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(mapDivRef.current).setView(DEFAULT_CENTER, 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Hàm zoom / recenter cho MapPage gọi qua window
    window.zoomMap = (isZoomIn) => {
      if (!mapRef.current) return;
      const z = mapRef.current.getZoom();
      mapRef.current.setZoom(isZoomIn ? z + 1 : z - 1);
    };

    window.recenterMap = () => {
      if (!mapRef.current) return;
      mapRef.current.setView(DEFAULT_CENTER, 12);
    };

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Load danh sách vị trí xe ban đầu (1 lần + khi đổi tuyến)
  useEffect(() => {
    const fetchPositions = async () => {
      const map = mapRef.current;
      if (!map) return;

      try {
        const res = await fetch(`${API_BASE}/buses/positions`);
        if (!res.ok) {
          console.error("API /buses/positions error:", res.status);
          return;
        }
        const buses = await res.json();
        updateBusMarkers(buses, { replaceAll: true });
      } catch (err) {
        console.error("fetchPositions error:", err);
      }
    };

    fetchPositions();
  }, [selectedRouteId]); // đổi tuyến → load lại và lọc theo tuyến mới

  // Kết nối WebSocket (Socket.IO) để nhận realtime vị trí xe
  useEffect(() => {
    // API_BASE = http://localhost:3000/api  → bỏ /api để lấy origin server
    const socketUrl = API_BASE.replace("/api", "");
    const socket = io(socketUrl, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);
    });

    socket.on("bus_position", (bus) => {
      // chỉ cập nhật 1 (hoặc vài) xe, không xoá marker khác
      updateBusMarkers([bus], { replaceAll: false });
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
    });

    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chỉ kết nối 1 lần

  // Khi đổi tuyến → load stops + OSRM, vẽ polyline + marker trạm
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedRouteId) return;

    const loadRoute = async () => {
      try {
        const res = await fetch(`${API_BASE}/routes/${selectedRouteId}/stops`);
        if (!res.ok) {
          console.error("/routes/:id/stops error:", res.status);
          return;
        }
        const stops = await res.json();

        // clear polyline cũ
        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }
        // clear marker trạm cũ
        stopMarkersRef.current.forEach((m) => map.removeLayer(m));
        stopMarkersRef.current = [];

        if (!Array.isArray(stops) || stops.length === 0) return;

        // vẽ marker trạm
        const stopLatLngs = [];
        stops.forEach((s) => {
          const lat = s.lat;
          const lng = s.lng;
          stopLatLngs.push([lat, lng]);

          const m = L.circleMarker([lat, lng], {
            radius: 5,
            color: "red",
            fillColor: "yellow",
            fillOpacity: 0.8,
          }).addTo(map);
          m.bindPopup(`Trạm: ${s.name}<br/>Thứ tự: ${s.stop_order}`);
          stopMarkersRef.current.push(m);
        });

        // Gọi OSRM để bám đường phố
        const coordsStr = stops.map((s) => `${s.lng},${s.lat}`).join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

        let routeLatLngs = stopLatLngs; // fallback nếu OSRM lỗi

        try {
          const r = await fetch(url);
          const data = await r.json();

          if (
            data.code === "Ok" &&
            data.routes &&
            data.routes.length > 0 &&
            data.routes[0].geometry
          ) {
            const coords = data.routes[0].geometry.coordinates; // [lng,lat]
            routeLatLngs = coords.map(([lng, lat]) => [lat, lng]);
          } else {
            console.warn("OSRM không trả route, dùng đường thẳng nối trạm.");
          }
        } catch (err2) {
          console.error("Lỗi gọi OSRM:", err2);
        }

        routeLayerRef.current = L.polyline(routeLatLngs, {
          color: "blue",
          weight: 4,
        }).addTo(map);

        map.fitBounds(routeLayerRef.current.getBounds(), {
          padding: [20, 20],
        });
      } catch (err) {
        console.error("loadRoute error:", err);
      }
    };

    loadRoute();
  }, [selectedRouteId]);

  return (
    <div
      ref={mapDivRef}
      id="map"
      style={{ width: "100%", height: "100%", borderRadius: 16 }}
    />
  );
};

export default BusMapOptimized;
