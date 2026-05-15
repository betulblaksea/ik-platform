import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
