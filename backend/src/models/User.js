import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['hr', 'employee'], default: 'employee' },
  position: String,
  dept: String,
  status: { type: String, enum: ['Active', 'On Leave', 'Remote'], default: 'Active' },
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Seed işlemi için geçici olarak false yapabiliriz veya bir HR ID'si verebiliriz
  }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
