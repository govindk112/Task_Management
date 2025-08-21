// src/services/notificationService.js
import prisma from "../lib/prisma.js";

export async function createNotification({ userId, type, title, message, link }) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

export async function getUserNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(notificationId, userId) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function deleteNotification(notificationId, userId) {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}
