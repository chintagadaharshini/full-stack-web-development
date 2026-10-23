import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import resourceRoutes from "./routes/resources.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "carepoint-api" }));
app.use("/api/auth", authRoutes);
app.use("/api", resourceRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: "A record with this unique value already exists." });
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid record ID or field value." });
  res.status(500).json({ message: "Server error. Check the backend terminal." });
});

connectDB()
  .then(() => app.listen(port, () => console.log(`CarePoint API running at http://localhost:${port}`)))
  .catch(err => { console.error("Could not start server:", err.message); process.exit(1); });
