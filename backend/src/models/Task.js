import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
    },
    description: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: String, default: "" },
    timeUnit: { type: String, enum: ["hours", "days"], default: "hours" },
    estimated: { type: Number, default: 8, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
    team: { type: String, default: "Genel" },
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);
