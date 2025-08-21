import express from "express";
import { authenticate } from "../services/middleware.auth.js";
import { addComment, getTaskComments, deleteComment } from "../services/commentService.js";

const router = express.Router();

// Add comment to a task
router.post("/:taskId", authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await addComment(req.params.taskId, req.user.userId, content);
    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all comments for a task
router.get("/:taskId", authenticate, async (req, res) => {
  try {
    const comments = await getTaskComments(req.params.taskId);
    res.json(comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a comment
router.delete("/:commentId", authenticate, async (req, res) => {
  try {
    const result = await deleteComment(req.params.commentId, req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
});

export default router;
