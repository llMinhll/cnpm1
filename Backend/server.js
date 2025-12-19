require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const Bus = require("./models/Bus");
const Route = require("./models/Route");
const authRoutes = require("./routes/auth.routes");
const routeRoutes = require("./routes/route.routes");
const busRoutes = require("./routes/bus.routes");
const customerRoutes = require("./routes/customer.routes");
const adminUsersRoutes = require("./routes/admin.users.routes");
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Tạo server http + socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Cho phép routes truy cập socket.io
app.set("io", io);

// Socket events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminUsersRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "SmartBus API OK" }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Map client join phòng theo tuyến để chỉ nhận dữ liệu cần thiết
  socket.on("join_route", (routeId) => {
    if (!routeId) return;
    socket.join(String(routeId));
  });

  socket.on("leave_route", (routeId) => {
    if (!routeId) return;
    socket.leave(String(routeId));
  });

  // Driver gửi GPS realtime
  // payload: { bus_id, lat, lng, speed }
  socket.on("bus_position", async (payload) => {
    try {
      const { bus_id, lat, lng, speed } = payload || {};
      if (!bus_id || lat == null || lng == null) return;

      const bus = await Bus.findById(bus_id).populate("route");
      if (!bus) return;

      bus.lat = Number(lat);
      bus.lng = Number(lng);
      bus.speed = speed != null ? Number(speed) : 0;
      await bus.save();

      const msg = {
        id: bus.id,
        plate: bus.plate,
        route_id: bus.route?.id,
        route_code: bus.route?.code,
        lat: bus.lat,
        lng: bus.lng,
        speed: bus.speed || 0,
      };

      // Nếu xe có route => phát theo room route để nhẹ
      if (bus.route?.id) io.to(String(bus.route.id)).emit("bus_position", msg);
      // Đồng thời phát global 
      io.emit("bus_position", msg);
    } catch (e) {
      console.error("bus_position error:", e.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

