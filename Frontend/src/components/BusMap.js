// src/components/BusMap.js
import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const DEFAULT_CENTER = [16.047, 108.206]; // Đà Nẵng

// icon bus
const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61235.png",
  iconSize: [30, 30],
});

let mapInstance = null;

function MapController({ polyline }) {
  const map = useMap();
  mapInstance = map;

  // hàm zoom + / – và recenter giống code JS cũ
  window.zoomMap = (isZoomIn) => {
    if (!mapInstance) return;
    const z = mapInstance.getZoom();
    mapInstance.setZoom(isZoomIn ? z + 1 : z - 1);
  };

  window.recenterMap = () => {
    if (!mapInstance) return;
    mapInstance.setView(DEFAULT_CENTER, 12);
  };

  // mỗi khi polyline thay đổi, fitBounds
  useEffect(() => {
    if (polyline && polyline.length > 0 && mapInstance) {
      const bounds = L.latLngBounds(polyline);
      mapInstance.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [polyline]);

  return null;
}

/**
 * props:
 * - stops: [{lat, lng, name, stop_order}]
 * - polyline: [[lat,lng], ...] bám đường phố
 * - buses: [{ id, plate, route_id, lat, lng, speed }]
 * - selectedRouteId: để lọc bus theo route (nếu cần)
 */
function BusMap({ stops, polyline, buses, selectedRouteId }) {
  // lọc xe: nếu chọn tuyến -> chỉ hiện xe tuyến đó
  const visibleBuses = selectedRouteId
    ? buses.filter((b) => b.route_id === selectedRouteId)
    : buses;

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={12}
      zoomControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <MapController polyline={polyline} />

      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* polyline tuyến theo OSRM */}
      {polyline && polyline.length > 0 && (
        <Polyline positions={polyline} color="blue" weight={4} />
      )}

      {/* trạm tuyến */}
      {stops &&
        stops.map((s) => (
          <CircleMarker
            key={s.id || s.stop_order}
            center={[s.lat, s.lng]}
            radius={5}
            pathOptions={{ color: "red", fillColor: "yellow", fillOpacity: 0.8 }}
          >
            <Popup>
              Trạm: {s.name}
              <br />
              Thứ tự: {s.stop_order}
            </Popup>
          </CircleMarker>
        ))}

      {/* xe buýt */}
      {visibleBuses.map((bus) => {
        if (!bus.lat || !bus.lng) return null;
        return (
          <Marker
            key={bus.id || bus.bus_id}
            position={[bus.lat, bus.lng]}
            icon={busIcon}
          >
            <Popup>
              <b>{bus.plate}</b>
              <br />
              Tuyến: {bus.route_id}
             <br />
              Tốc độ: {bus.speed || 0} km/h
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default BusMap;
