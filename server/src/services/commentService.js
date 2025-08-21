// src/services/commentService.js
import prisma from "../lib/prisma.js";
import { createNotification } from "./notificationService.js";

// Add a comment
export async function addComment(taskId, userId, content) {
  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      authorId: userId,
    },
    include: { task: true },
  });

  // ✅ If the task has an assignee, notify them
  if (comment.task.assigneeId && comment.task.assigneeId !== userId) {
    await createNotification({
      userId: comment.task.assigneeId,
      type: "task_commented",
      title: "New comment on your task",
      message: `New comment: "${comment.content}" on task "${comment.task.title}"`,
      link: `/projects/${comment.task.projectId}/tasks/${comment.task.id}`,
    });
  }

  return comment;
}

// Get all comments for a task
export async function getTaskComments(taskId) {
  return prisma.comment.findMany({
    where: { taskId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
}

// Delete a comment
export async function deleteComment(commentId, userId) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Comment not found");
  if (comment.authorId !== userId) throw new Error("Not authorized to delete this comment");

  return prisma.comment.delete({ where: { id: commentId } });
}
