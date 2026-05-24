import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["manager", "employee"], default: "employee" },
  position: String,
  dept: String,
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
