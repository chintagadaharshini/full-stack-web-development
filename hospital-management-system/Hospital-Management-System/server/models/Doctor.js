import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  specialization: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true, default: "" },
  availability: { type: String, enum: ["Available", "Busy", "On leave"], default: "Available" }
}, { timestamps: true });
export default mongoose.model("Doctor", schema);
