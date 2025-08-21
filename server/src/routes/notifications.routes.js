import express from "express";
import { authenticate } from "../services/middleware.auth.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../services/notificationService.js";

const router = express.Router();

// Get all notifications for logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.userId);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.put("/:id/read", authenticate, async (req, res) => {
  try {
    await markNotificationAsRead(req.params.id, req.user.userId);
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.user.userId);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
