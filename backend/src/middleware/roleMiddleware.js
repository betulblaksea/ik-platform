import { User } from "../models/User.js";

export async function attachUser(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Oturum gerekli" });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("attachUser:", error);
    return res.status(500).json({ message: "Kullanıcı bilgisi alınamadı" });
  }
}

export function isManager(req, res, next) {
  if (req.user?.role !== "manager") {
    return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir." });
  }
  next();
}

export function isEmployee(req, res, next) {
  if (req.user?.role !== "employee") {
    return res.status(403).json({ message: "Bu işlem yalnızca çalışanlar içindir" });
  }
  next();
}
