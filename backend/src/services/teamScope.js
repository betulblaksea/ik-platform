import { User } from "../models/User.js";

/** İstek sahibine göre erişilebilir çalışan ID listesi */
export async function getTeamScope(req) {
  const user = await User.findById(req.userId);
  if (!user) return null;

  if (user.role === "employee") {
    return { role: "employee", user, employeeIds: [user._id] };
  }

  if (user.role === "manager") {
    const team = await User.find({ role: "employee", addedBy: user._id }).select("_id");
    return {
      role: "manager",
      user,
      employeeIds: team.map((e) => e._id),
    };
  }

  return null;
}
