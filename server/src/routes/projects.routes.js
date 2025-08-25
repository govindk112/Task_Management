// src/routes/projects.routes.js
import express from "express";
import { authenticate, requireRole } from "../services/middleware.auth.js";
import {
  createProject,
  getUserProjects,
  getProjectById,
} from "../services/projectService.js";
import prisma from "../lib/prisma.js";
import {
  addMemberToProject,
  listProjectMembers,
  removeMemberFromProject,
} from "../services/memberService.js";

const router = express.Router();

// Only admins can create projects
router.post("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const project = await createProject(
      req.user.userId,
      req.body.name,
      req.body.description
    );
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Both Admins & Users can fetch projects they belong to
router.get("/", authenticate, async (req, res) => {
  try {
    const projects = await getUserProjects(req.user.userId);
    res.json(projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get project by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update project
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, colorCode } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.ownerId !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { name, description, colorCode },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.ownerId !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.project.delete({ where: { id } });

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member (by email OR userId) — owner only
router.post("/:id/members", authenticate, async (req, res) => {
  try {
    const { email, userId } = req.body;
    const result = await addMemberToProject(
      req.params.id,
      req.user.userId,
      { email, userId }
    );
    res.json(result);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// List members — owner or project member can view
router.get("/:id/members", authenticate, async (req, res) => {
  try {
    const result = await listProjectMembers(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// Remove member — owner only
router.delete("/:id/members/:userId", authenticate, async (req, res) => {
  try {
    const result = await removeMemberFromProject(
      req.params.id,
      req.user.userId,
      req.params.userId
    );
    res.json(result);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

export default router;
