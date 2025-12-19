const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// GET: danh sách user/driver
router.get("/users", auth, isAdmin, async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select("-password");
  res.json(users);
});

// PATCH: sửa thông tin
router.patch("/users/:id", auth, isAdmin, async (req, res) => {
  const { full_name, phone, role, is_active } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { full_name, phone, role, is_active },
    { new: true }
  ).select("-password");

  res.json(user);
});

// RESET PASSWORD
router.patch("/users/:id/password", auth, isAdmin, async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  await User.findByIdAndUpdate(req.params.id, { password: hashed });
  res.json({ message: "Password reset" });
});
// CREATE USER / DRIVER
router.post("/users", auth, isAdmin, async (req, res) => {
  const { full_name, email, phone, password, role, is_active } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });
  }

  const existed = await User.findOne({ email });
  if (existed) {
    return res.status(400).json({ message: "Email đã tồn tại" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    full_name,
    email,
    phone,
    password: hashed,
    role: role || "user",
    is_active: is_active !== false,
  });

  res.json({
    message: "Tạo tài khoản thành công",
    user: {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = router;
