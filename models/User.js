// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["basic", "manager", "admin"],
      default: "basic",
    },
    isActive: { type: Boolean, default: true },
    //cloudinary pfps
    pfpId: { type: String, trim: true, default: "" },
    pfpUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plainPassword) {
  if (typeof plainPassword !== "string" || plainPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  this.passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

userSchema.methods.verifyPassword = async function (plainPassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
