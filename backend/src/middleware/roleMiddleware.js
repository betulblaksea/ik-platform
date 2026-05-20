import { User } from "../models/User.js";

// Sadece HR rolündeki kullanıcıların geçebileceği middleware
export const isHR = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user?.role !== "hr") {
      return res.status(403).json({ message: "Bu işlem için İK yetkisi gereklidir." });
    }
    next();
  } catch (error) {
    console.error("isHR Middleware Error:", error);
    res.status(500).json({ message: "Yetki kontrolü sırasında sunucu hatası oluştu." });
  }
};