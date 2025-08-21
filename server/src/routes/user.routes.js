import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Get all users (excluding project owners if needed)
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
