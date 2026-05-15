import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign({ sub: userId.toString() }, secret, { expiresIn: "7d" });
}

function userResponse(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function register(req, res) {
  try {
    const { email, password, name = "", role = "employee" } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (role !== "employee" && role !== "hr") {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
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
    return res.status(500).json({ message: "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password, role: portalRole } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
      "+password"
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (portalRole && (portalRole === "employee" || portalRole === "hr") && user.role !== portalRole) {
      return res.status(403).json({ message: "This account cannot sign in with the selected role" });
    }

    const token = signToken(user._id);
    return res.json({ token, user: userResponse(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user: userResponse(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load profile" });
  }
}
