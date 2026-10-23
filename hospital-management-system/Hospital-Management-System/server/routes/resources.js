import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Bed from "../models/Bed.js";
import Medicine from "../models/Medicine.js";
import Bill from "../models/Bill.js";

const router = Router();
router.use(requireAuth);

const models = { patients: Patient, doctors: Doctor, appointments: Appointment, beds: Bed, medicines: Medicine, bills: Bill };
const readableNames = {
  patients: "patients", doctors: "doctors", appointments: "appointments",
  beds: "beds", medicines: "medicines", bills: "bills"
};

router.get("/dashboard", async (_req, res, next) => {
  try {
    const [patients, doctors, appointments, beds, medicines, bills, pendingBills, occupiedBeds, upcomingAppointments] = await Promise.all([
      Patient.countDocuments(), Doctor.countDocuments(), Appointment.countDocuments(), Bed.countDocuments(),
      Medicine.countDocuments(), Bill.countDocuments({ status: "Pending" }),
      Bed.countDocuments({ status: "Occupied" }),
      Appointment.countDocuments({ status: "Scheduled" })
    ]);
    const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(5);
    const lowStock = await Medicine.find({ quantity: { $lte: 10 } }).sort({ quantity: 1 }).limit(5);
    res.json({ stats: { patients, doctors, appointments, beds, medicines, pendingBills, occupiedBeds, upcomingAppointments }, recentAppointments, lowStock });
  } catch (err) { next(err); }
});

router.get("/:resource", async (req, res, next) => {
  try {
    const Model = models[req.params.resource];
    if (!Model) return res.status(404).json({ message: "Unknown resource." });
    const { search = "", status = "" } = req.query;
    const filter = {};
    if (status && ["appointments", "beds", "bills"].includes(req.params.resource)) filter.status = status;
    let query = Model.find(filter).sort({ createdAt: -1 }).limit(500);
    const rows = await query;
    const term = String(search).trim().toLowerCase();
    const result = term ? rows.filter(row => Object.values(row.toObject()).some(value =>
      typeof value === "string" && value.toLowerCase().includes(term)
    )) : rows;
    res.json({ items: result });
  } catch (err) { next(err); }
});

router.post("/:resource", async (req, res, next) => {
  try {
    const Model = models[req.params.resource];
    if (!Model) return res.status(404).json({ message: "Unknown resource." });
    if (req.params.resource === "doctors" && req.user.role !== "Admin") return res.status(403).json({ message: "Only admins can add doctors." });
    const item = await Model.create(req.body);
    res.status(201).json({ item });
  } catch (err) { next(err); }
});

router.put("/:resource/:id", async (req, res, next) => {
  try {
    const Model = models[req.params.resource];
    if (!Model) return res.status(404).json({ message: "Unknown resource." });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid record ID." });
    if (req.params.resource === "doctors" && req.user.role !== "Admin") return res.status(403).json({ message: "Only admins can edit doctors." });
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Record not found." });
    res.json({ item });
  } catch (err) { next(err); }
});

router.delete("/:resource/:id", requireAdmin, async (req, res, next) => {
  try {
    const Model = models[req.params.resource];
    if (!Model) return res.status(404).json({ message: "Unknown resource." });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid record ID." });
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Record not found." });
    res.json({ message: "Record deleted." });
  } catch (err) { next(err); }
});

export default router;
