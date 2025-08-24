import express from "express";
import { authenticate, requireRole } from "../services/middleware.auth.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Get all users (ADMIN only)
router.get("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
  });
  res.json(users);
});

export default router;
