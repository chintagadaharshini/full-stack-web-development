import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role });
const signToken = user => jwt.sign(
  { userId: user._id.toString(), role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "8h" }
);

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email, and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "This email is already registered." });
    // For a local classroom demo only. In production, privileged roles must be assigned by an administrator.
    const role = ["Admin", "Doctor", "Receptionist"].includes(req.body.role) ? req.body.role : "Receptionist";
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(String(req.body.password || ""), user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (err) { next(err); }
});

export default router;
