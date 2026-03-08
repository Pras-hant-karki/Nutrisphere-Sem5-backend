import { Router } from "express";
import { authorizedMiddelWare } from "../middelwares/authorized.middelware";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

/**
 * Notification Routes
 * Prefix: /api/notifications
 * All routes require authentication
 */

// GET - Get all notifications for the authenticated user
router.get(
    "/",
    authorizedMiddelWare,
    NotificationController.getNotifications
);

// GET - Get unread notification count
router.get(
    "/unread-count",
    authorizedMiddelWare,
    NotificationController.getUnreadCount
);

// PUT - Mark all notifications as read
router.put(
    "/read-all",
    authorizedMiddelWare,
    NotificationController.markAllAsRead
);

// PUT - Mark a single notification as read
router.put(
    "/:id/read",
    authorizedMiddelWare,
    NotificationController.markAsRead
);

// DELETE - Delete a notification
router.delete(
    "/:id",
    authorizedMiddelWare,
    NotificationController.deleteNotification
);

export default router;
