import { User } from "../models/User.js";
import { getEmployeesForManager } from "../services/employeeScope.js";

export async function listUsers(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "manager") {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir." });
    }

    const users = await getEmployeesForManager(req.userId);
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Çalışan listesi alınamadı" });
  }
}
