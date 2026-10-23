import mongoose from "mongoose";
const schema = new mongoose.Schema({
  bedNumber: { type: String, required: true, trim: true, unique: true },
  ward: { type: String, required: true, trim: true },
  type: { type: String, enum: ["General", "Private", "ICU"], default: "General" },
  status: { type: String, enum: ["Available", "Occupied", "Maintenance"], default: "Available" },
  patientName: { type: String, trim: true, default: "" }
}, { timestamps: true });
export default mongoose.model("Bed", schema);
