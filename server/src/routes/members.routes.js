import express from "express";
import { authenticate, requireRole } from "../services/middleware.auth.js";
import prisma from "../lib/prisma.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Add member (ADMIN only)
router.post("/:projectId/members", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const { userId } = req.body;
    const projectId = req.params.projectId;

    const member = await prisma.projectMember.create({
      data: { userId, projectId },
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId,
        type: "member_added",
        title: "Added to project",
        message: `You have been added to project ${projectId}`,
        link: `/projects/${projectId}`,
      },
    });

    // Send email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Added to Project",
        text: `Hello ${user.name}, you have been added to project ${projectId}`,
      });
    }

    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove member (ADMIN only)
router.delete("/:projectId/members/:userId", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: req.params.userId,
          projectId: req.params.projectId,
        },
      },
    });
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List members
router.get("/:projectId/members", authenticate, async (req, res) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.projectId },
      include: { user: true },
    });
    res.json(members);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
