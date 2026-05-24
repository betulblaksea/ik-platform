import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    departureTime: { type: String, default: "" },
    expectedArrival: { type: String, default: "09:00" },
    category: {
      type: String,
      enum: ["traffic", "health", "family", "technical", "ontime"],
      default: "ontime",
    },
    delayMinutes: { type: Number, default: 0, min: 0 },
    commuteMethod: {
      type: String,
      enum: ["metrobus", "car", "marmaray", "walk", "other", ""],
      default: "",
    },
    workMode: {
      type: String,
      enum: ["office", "remote", ""],
      default: "office",
    },
    note: { type: String, default: "" },
    daySummary: { type: String, default: "" },
    energyLevel: { type: Number, min: 1, max: 5, default: null },
  },
  { timestamps: true },
);

checkInSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const CheckIn = mongoose.model("CheckIn", checkInSchema);
