// src/routes/tasks.routes.js
import express from "express";
import { authenticate } from "../services/middleware.auth.js";
import prisma from "../lib/prisma.js";
import {
  canAccessProject,
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/taskService.js";

const router = express.Router();

/**
 * GET /projects/:projectId/tasks
 * List tasks in a project (owner or member)
 */
router.get("/projects/:projectId/tasks", authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const access = await canAccessProject(projectId, req.user.userId);
    if (!access.allowed) {
      return res.status(access.status ?? 403).json({ error: access.reason ?? "Not authorized" });
    }

    const tasks = await getTasksByProject(projectId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /projects/:projectId/tasks
 * Create a task in a project (owner or member)
 */
router.post("/projects/:projectId/tasks", authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const access = await canAccessProject(projectId, req.user.userId);
    if (!access.allowed) {
      return res.status(access.status ?? 403).json({ error: access.reason ?? "Not authorized" });
    }

    const task = await createTask(projectId, req.user.userId, req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /tasks/:taskId
 * Update a task (project owner or current assignee)
 */
router.put("/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await getTaskById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // fetch project for permission
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: true },
    });

    const isOwner = project.ownerId === req.user.userId;
    const isAssignee = task.assigneeId === req.user.userId;

    if (!isOwner && !isAssignee) {
      return res.status(403).json({ error: "Not authorized to update this task" });
    }

    const updated = await updateTask(taskId, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /tasks/:taskId
 * Delete a task (project owner only)
 */
router.delete("/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await getTaskById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // only project owner can delete
    const project = await prisma.project.findUnique({ where: { id: task.projectId } });
    if (project.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized to delete this task" });
    }

    await deleteTask(taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
