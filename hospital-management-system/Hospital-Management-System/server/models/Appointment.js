import mongoose from "mongoose";
const schema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  doctorName: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" }
}, { timestamps: true });
export default mongoose.model("Appointment", schema);
