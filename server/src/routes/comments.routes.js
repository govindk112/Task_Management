import express from "express";
import { authenticate } from "../services/middleware.auth.js";
import { addComment, getTaskComments, deleteComment } from "../services/commentService.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Add Comment (ADMIN + USER)
router.post("/:taskId/comments", authenticate, async (req, res) => {
  try {
    const comment = await addComment(req.params.taskId, req.user.userId, req.body.content);
    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get comments for a task
router.get("/:taskId/comments", authenticate, async (req, res) => {
  try {
    const comments = await getTaskComments(req.params.taskId);
    res.json(comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete comment (admin OR author)
router.delete("/comments/:id", authenticate, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (req.user.role !== "ADMIN" && comment.authorId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await deleteComment(req.params.id, req.user.userId);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
