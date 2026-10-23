import mongoose from "mongoose";
const schema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["Paid", "Pending", "Overdue"], default: "Pending" },
  dueDate: { type: String, default: "" }
}, { timestamps: true });
export default mongoose.model("Bill", schema);
