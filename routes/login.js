//login.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

//admin create user form submits here
router.post("/admin-create", async (req, res) => {
  if (!req.session?.userId || req.session.role !== "admin") {
    return res.status(403).send("Forbidden");
  }
  try {
    const email = String(req.body.email || "")
      .toLowerCase()
      .trim();
    const password = String(req.body.password || "");
    const roleRaw = String(req.body.role || "")
      .toLowerCase()
      .trim();

    const allowedRoles = new Set(["basic", "manager", "admin"]);
    const role = allowedRoles.has(roleRaw) ? roleRaw : "basic";
    const name = String(req.body.name || "").trim();
    const user = new User({ name, email, role });
    await user.setPassword(password);
    await user.save();

    return res.redirect("/admin");
  } catch (err) {
    if (err && err.code === 11000)
      return res.status(409).send("Email already in use.");
    return res.status(400).send(err.message || "Failed to create user");
  }
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "")
    .toLowerCase()
    .trim();
  const password = String(req.body.password || "");

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user)
    return res
      .status(401)
      .render("pages/login", { error: "Invalid credentials" });

  const ok = await user.verifyPassword(password);
  if (!ok)
    return res
      .status(401)
      .render("pages/login", { error: "Invalid credentials" });

  req.session.userId = user._id.toString();
  req.session.userEmail = user.email;
  req.session.userName = user.name;
  req.session.role = user.role;

  return res.redirect("/");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

module.exports = router;
