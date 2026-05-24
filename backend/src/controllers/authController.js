import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { employeeResponse } from "../services/employeeScope.js";

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign({ sub: userId.toString() }, secret, { expiresIn: "7d" });
}

function userResponse(user) {
  const base = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  if (user.role === "employee" && user.addedBy && typeof user.addedBy === "object") {
    base.addedBy = {
      id: user.addedBy._id?.toString?.() ?? String(user.addedBy._id),
      name: user.addedBy.name,
      email: user.addedBy.email,
    };
  }
  return base;
}

export async function register(req, res) {
  try {
    const { email, password, name = "", role = "employee" } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "E-posta ve şifre zorunludur" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır" });
    }
    if (role !== "employee" && role !== "manager") {
      return res.status(400).json({ message: "Geçersiz rol" });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Bu e-posta zaten kayıtlı" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: String(email).toLowerCase().trim(),
      password: hash,
      name: String(name).trim(),
      role,
    });

    const token = signToken(user._id);
    return res.status(201).json({ token, user: userResponse(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kayıt işlemi başarısız" });
  }
}

export async function login(req, res) {
  try {
    const { email, password, role: portalRole } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "E-posta ve şifre zorunludur" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
      "+password"
    );
    if (!user) {
      return res.status(401).json({ message: "Geçersiz e-posta veya şifre" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Geçersiz e-posta veya şifre" });
    }

    if (
      portalRole &&
      (portalRole === "employee" || portalRole === "manager") &&
      user.role !== portalRole
    ) {
      return res.status(403).json({ message: "Bu hesap seçilen rol ile giriş yapamaz" });
    }

    const token = signToken(user._id);
    return res.json({ token, user: userResponse(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Giriş işlemi başarısız" });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.userId).populate("addedBy", "name email");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    return res.json({ user: userResponse(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Profil yüklenemedi" });
  }
}

export const addEmployee = async (req, res) => {
  try {
    const { name, email, password, position, dept } = req.body ?? {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Ad, e-posta ve şifre zorunludur" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Bu e-posta zaten kayıtlı" });
    }

    const hash = await bcrypt.hash(password, 10);

    const newEmployee = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hash,
      position: position || "",
      dept: dept || "Genel",
      role: "employee",
      addedBy: req.userId,
    });

    res.status(201).json({
      message: "Çalışan başarıyla eklendi",
      user: employeeResponse(newEmployee),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
