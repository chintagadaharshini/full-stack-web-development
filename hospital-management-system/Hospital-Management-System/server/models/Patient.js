import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  age: { type: Number, required: true, min: 0, max: 125 },
  gender: { type: String, enum: ["Female", "Male", "Other"], required: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  notes: { type: String, trim: true, default: "" }
}, { timestamps: true });
export default mongoose.model("Patient", schema);
