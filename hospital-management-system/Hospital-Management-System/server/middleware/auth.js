import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Please sign in to continue." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid or expired. Please sign in again." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "Admin") return res.status(403).json({ message: "Admin access required." });
  next();
}
