// src/services/middleware.auth.js
import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, iat, exp }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}
