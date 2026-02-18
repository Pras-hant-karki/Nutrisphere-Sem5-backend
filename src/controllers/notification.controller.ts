import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { HttpError } from "../errors/http-error";

const notificationService = new NotificationService();

export class NotificationController {
    /**
     * GET /api/notifications
     * Get all notifications for the authenticated user
     */
    static async getNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)._id.toString();
            const notifications = await notificationService.getNotifications(userId);

            return res.status(200).json({
                success: true,
                message: "Notifications fetched successfully",
                data: notifications,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/notifications/unread-count
     * Get unread notification count
     */
    static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)._id.toString();
            const count = await notificationService.getUnreadCount(userId);

            return res.status(200).json({
                success: true,
                data: { count },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/notifications/:id/read
     * Mark a single notification as read
     */
    static async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)._id.toString();
            const { id } = req.params;

            const notification = await notificationService.markAsRead(id, userId);

            return res.status(200).json({
                success: true,
                message: "Notification marked as read",
                data: notification,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/notifications/read-all
     * Mark all notifications as read
     */
    static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)._id.toString();
            await notificationService.markAllAsRead(userId);

            return res.status(200).json({
                success: true,
                message: "All notifications marked as read",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/notifications/:id
     * Delete a notification
     */
    static async deleteNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)._id.toString();
            const { id } = req.params;

            await notificationService.deleteNotification(id, userId);

            return res.status(200).json({
                success: true,
                message: "Notification deleted",
            });
        } catch (error) {
            next(error);
        }
    }
}
