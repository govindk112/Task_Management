import express from "express";
import { authenticate, requireRole } from "../services/middleware.auth.js";
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/taskService.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Create Task (ADMIN only)
router.post("/:projectId/tasks", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const task = await createTask(req.params.projectId, req.user.userId, req.body);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tasks for a project (ADMIN + USER)
router.get("/:projectId/tasks", authenticate, async (req, res) => {
  try {
    const tasks = await getTasksByProject(req.params.projectId);
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single task
router.get("/tasks/:id", authenticate, async (req, res) => {
  try {
    const task = await getTaskById(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Task
router.put("/tasks/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role === "USER") {
      // Users can only update status
      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
      });
      return res.json(updated);
    }

    // Admin can update all fields
    const updated = await updateTask(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Task (ADMIN only)
router.delete("/tasks/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    await deleteTask(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
