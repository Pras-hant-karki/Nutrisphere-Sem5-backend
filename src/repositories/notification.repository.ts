import { NotificationModel, INotification } from "../models/notification.model";
import mongoose from "mongoose";

export class NotificationRepository {
    /**
     * Create a new notification
     */
    async create(data: Partial<INotification>): Promise<INotification> {
        return await NotificationModel.create(data);
    }

    /**
     * Create notifications for multiple recipients (e.g., all users)
     */
    async createMany(notifications: Partial<INotification>[]): Promise<INotification[]> {
        return await NotificationModel.insertMany(notifications) as INotification[];
    }

    /**
     * Get all notifications for a specific user
     */
    async getByRecipientId(recipientId: string | mongoose.Types.ObjectId): Promise<INotification[]> {
        return await NotificationModel.find({ recipientId })
            .sort({ createdAt: -1 });
    }

    /**
     * Get unread notifications for a user
     */
    async getUnreadByRecipientId(recipientId: string | mongoose.Types.ObjectId): Promise<INotification[]> {
        return await NotificationModel.find({ recipientId, isRead: false })
            .sort({ createdAt: -1 });
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(recipientId: string | mongoose.Types.ObjectId): Promise<number> {
        return await NotificationModel.countDocuments({ recipientId, isRead: false });
    }

    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId: string | mongoose.Types.ObjectId): Promise<INotification | null> {
        return await NotificationModel.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(recipientId: string | mongoose.Types.ObjectId): Promise<void> {
        await NotificationModel.updateMany(
            { recipientId, isRead: false },
            { isRead: true }
        );
    }

    /**
     * Delete a notification
     */
    async delete(notificationId: string | mongoose.Types.ObjectId): Promise<INotification | null> {
        return await NotificationModel.findByIdAndDelete(notificationId);
    }
}
