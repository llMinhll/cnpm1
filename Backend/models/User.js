const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "driver", "admin"],
      default: "user",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // tự thêm createdAt & updatedAt
);

module.exports = mongoose.model("User", UserSchema);
