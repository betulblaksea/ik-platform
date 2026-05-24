import { getEmployeesForManager } from "../services/employeeScope.js";

export async function listUsers(req, res) {
  try {
    const users = await getEmployeesForManager(req.userId);
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Çalışan listesi alınamadı" });
  }
}
