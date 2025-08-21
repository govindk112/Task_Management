// src/services/taskService.js
import prisma from "../lib/prisma.js";
import { createNotification } from "./notificationService.js";

/** Check if user is owner or member of a project */
export async function canAccessProject(projectId, userId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) return { allowed: false, status: 404, reason: "Project not found" };

  const isOwner = project.ownerId === userId;
  const isMember = project.members.some((m) => m.userId === userId);

  return { allowed: isOwner || isMember, isOwner, isMember, project };
}

/** Create a task (defaults assignee to the creator if not provided) */
export async function createTask(projectId, userId, data) {
  const { title, description, status, priority, dueDate, assigneeId } = data;

  if (!title) throw new Error("Title is required");

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      status: status ?? undefined,
      priority: priority ?? undefined,
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      assigneeId: assigneeId || userId, // default assign to creator
    },
  });

  // Notify the assignee if different from creator
  if (task.assigneeId && task.assigneeId !== userId) {
    await createNotification({
      userId: task.assigneeId,
      type: "task_assigned",
      title: "You were assigned a task",
      message: `You were assigned to task "${task.title}"`,
      link: `/projects/${projectId}/tasks/${task.id}`,
    });
  }

  return task;
}

/** Get all tasks for a project (with assignee) */
export async function getTasksByProject(projectId) {
  return prisma.task.findMany({
    where: { projectId },
    include: { assignee: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Get single task with its project */
export async function getTaskById(taskId) {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true, assignee: true },
  });
}

/** Update a task (only project owner or current assignee) */
export async function updateTask(taskId, updates, userId) {
  const { title, description, status, priority, dueDate, assigneeId } = updates;

  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) throw new Error("Task not found");

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId,
    },
  });

  // Notify new assignee if reassigned
  if (assigneeId && assigneeId !== existing.assigneeId) {
    await createNotification({
      userId: assigneeId,
      type: "task_reassigned",
      title: "You were reassigned a task",
      message: `You were assigned to task "${updated.title}"`,
      link: `/projects/${updated.projectId}/tasks/${updated.id}`,
    });
  }

  // Notify assignee if status changed
  if (status && status !== existing.status && updated.assigneeId) {
    await createNotification({
      userId: updated.assigneeId,
      type: "task_updated",
      title: "Task status updated",
      message: `The task "${updated.title}" is now "${status}"`,
      link: `/projects/${updated.projectId}/tasks/${updated.id}`,
    });
  }

  // Notify assignee if priority changed
  if (priority && priority !== existing.priority && updated.assigneeId) {
    await createNotification({
      userId: updated.assigneeId,
      type: "task_updated",
      title: "Task priority updated",
      message: `The task "${updated.title}" priority changed to "${priority}"`,
      link: `/projects/${updated.projectId}/tasks/${updated.id}`,
    });
  }

  return updated;
}

/** Delete a task */
export async function deleteTask(taskId) {
  return prisma.task.delete({ where: { id: taskId } });
}
