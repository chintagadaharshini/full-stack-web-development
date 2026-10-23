import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Bed from "../models/Bed.js";
import Medicine from "../models/Medicine.js";
import Bill from "../models/Bill.js";

try {
  await connectDB();
  await Promise.all([
    Patient.deleteMany({}), Doctor.deleteMany({}), Appointment.deleteMany({}),
    Bed.deleteMany({}), Medicine.deleteMany({}), Bill.deleteMany({})
  ]);
  const patients = await Patient.insertMany([
    { name: "Aarav Sharma", age: 32, gender: "Male", phone: "9876501234", email: "aarav.demo@example.com", address: "Green Park", notes: "Demo record" },
    { name: "Diya Reddy", age: 26, gender: "Female", phone: "9876502345", email: "diya.demo@example.com", address: "Lake View Road", notes: "Demo record" },
    { name: "Ishaan Kumar", age: 45, gender: "Male", phone: "9876503456", email: "ishaan.demo@example.com", address: "Central Avenue", notes: "Demo record" }
  ]);
  const doctors = await Doctor.insertMany([
    { name: "Dr. Ananya Rao", specialization: "Cardiology", phone: "9000011111", email: "ananya.demo@example.com", availability: "Available" },
    { name: "Dr. Kiran Mehta", specialization: "Orthopedics", phone: "9000022222", email: "kiran.demo@example.com", availability: "Available" },
    { name: "Dr. Sara Thomas", specialization: "Pediatrics", phone: "9000033333", email: "sara.demo@example.com", availability: "On leave" }
  ]);
  await Appointment.insertMany([
    { patientName: patients[0].name, doctorName: doctors[0].name, date: new Date().toISOString().slice(0,10), time: "10:30", reason: "Routine check-up", status: "Scheduled" },
    { patientName: patients[1].name, doctorName: doctors[2].name, date: new Date().toISOString().slice(0,10), time: "11:15", reason: "Follow-up", status: "Scheduled" },
    { patientName: patients[2].name, doctorName: doctors[1].name, date: new Date().toISOString().slice(0,10), time: "14:00", reason: "Consultation", status: "Completed" }
  ]);
  await Bed.insertMany([
    { bedNumber: "G-101", ward: "General A", type: "General", status: "Occupied", patientName: patients[0].name },
    { bedNumber: "G-102", ward: "General A", type: "General", status: "Available" },
    { bedNumber: "P-201", ward: "Private B", type: "Private", status: "Available" },
    { bedNumber: "I-01", ward: "ICU", type: "ICU", status: "Maintenance" }
  ]);
  await Medicine.insertMany([
    { name: "Paracetamol 500mg", category: "Pain relief", quantity: 120, price: 2, expiryDate: "2027-12-31" },
    { name: "Antiseptic Solution", category: "First aid", quantity: 8, price: 95, expiryDate: "2027-06-30" },
    { name: "Vitamin C", category: "Supplement", quantity: 65, price: 4, expiryDate: "2028-03-31" },
    { name: "Saline 500ml", category: "IV fluids", quantity: 6, price: 45, expiryDate: "2027-08-31" }
  ]);
  await Bill.insertMany([
    { patientName: patients[0].name, description: "Consultation and tests", amount: 1800, status: "Pending", dueDate: "2026-12-01" },
    { patientName: patients[1].name, description: "Outpatient consultation", amount: 650, status: "Paid", dueDate: "2026-10-20" },
    { patientName: patients[2].name, description: "Orthopedic consultation", amount: 1200, status: "Overdue", dueDate: "2026-10-01" }
  ]);
  console.log("Sample hospital records inserted.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
