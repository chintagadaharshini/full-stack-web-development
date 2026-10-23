import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 },
  expiryDate: { type: String, default: "" }
}, { timestamps: true });
export default mongoose.model("Medicine", schema);
