import mongoose from "mongoose";
import { User } from "../models/User.js";

export function employeeResponse(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    position: user.position || "",
    dept: user.dept || "Genel",
    addedBy: user.addedBy?.toString?.() ?? user.addedBy ?? null,
  };
}

export async function getEmployeesForManager(managerUserId) {
  const managerId = new mongoose.Types.ObjectId(managerUserId);
  const rows = await User.find({ role: "employee", addedBy: managerId })
    .select("-password")
    .sort({ createdAt: -1 });
  return rows.map(employeeResponse);
}
