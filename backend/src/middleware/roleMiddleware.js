import { User } from "../models/User.js";

/** Yalnızca yönetici (role: manager) hesaplarının geçebileceği middleware */
export const isManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user?.role !== "manager") {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir." });
    }
    next();
  } catch (error) {
    console.error("isManager Middleware Error:", error);
    res.status(500).json({ message: "Yetki kontrolü sırasında sunucu hatası oluştu." });
  }
};
