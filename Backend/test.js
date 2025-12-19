// gps_simulator.js
const axios = require("axios");

// Địa chỉ backend API
const API = "http://localhost:3000/api/buses/update-position";

// ID xe trong MongoDB (bus._id hoặc bus.id)
const BUS_ID = "69285ec43efca85e357dab0f";

// Tọa độ ban đầu
let lat = 16.047;
let lng = 108.206;

// Hàm random di chuyển
function moveRandom() {
  lat += (Math.random() - 0.5) * 0.001; // ± 0.0005
  lng += (Math.random() - 0.5) * 0.001;
  return { lat, lng };
}

// Gửi vị trí lên server
async function sendPosition() {
  const pos = moveRandom();

  try {
    await axios.post(API, {
      bus_id: BUS_ID,
      lat: pos.lat,
      lng: pos.lng,
      speed: Math.floor(Math.random() * 60),
    });

    console.log(`Đã gửi vị trí: ${pos.lat}, ${pos.lng}`);
  } catch (err) {
    console.error("Lỗi gửi vị trí:", err.message);
  }
}

// Gửi mỗi 1 giây
setInterval(sendPosition, 1000);

console.log(" GPS Simulator started...");
