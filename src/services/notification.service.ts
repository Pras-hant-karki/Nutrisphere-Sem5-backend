import { INotification } from "../models/notification.model";
import { NotificationRepository } from "../repositories/notification.repository";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

export class NotificationService {
    private notificationRepository: NotificationRepository;
    private userRepository: UserRepository;

    constructor() {
        this.notificationRepository = new NotificationRepository();
        this.userRepository = new UserRepository();
    }

    /**
     * Get all notifications for a user
     */
    async getNotifications(userId: string): Promise<INotification[]> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }
        return await this.notificationRepository.getByRecipientId(userId);
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }
        return await this.notificationRepository.getUnreadCount(userId);
    }

    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<INotification> {
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            throw new HttpError(400, "Invalid notification ID format");
        }

        const notification = await this.notificationRepository.markAsRead(notificationId);
        if (!notification) {
            throw new HttpError(404, "Notification not found");
        }

        // Verify the notification belongs to this user
        if (notification.recipientId.toString() !== userId) {
            throw new HttpError(403, "Not authorized to modify this notification");
        }

        return notification;
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }
        await this.notificationRepository.markAllAsRead(userId);
    }

    /**
     * Send notification to all users (non-admin) — used when admin creates post/session/updates bio
     */
    async notifyAllUsers(
        type: INotification["type"],
        title: string,
        message: string,
        senderId: string,
        relatedId?: string
    ): Promise<void> {
        const allUsers = await this.userRepository.getAllUsers();
        const regularUsers = allUsers.filter((u: any) => u.role !== "admin");

        if (regularUsers.length === 0) return;

        // Get sender details
        const sender = await this.userRepository.getUserById(senderId);
        if (!sender) return;

        const notifications = regularUsers.map((user: any) => ({
            recipientId: user._id,
            type,
            title,
            message,
            metadata: { 
                senderName: sender.fullName, 
                senderProfilePicture: sender.profilePicture,
                relatedId 
            },
        }));

        await this.notificationRepository.createMany(notifications);
    }

    /**
     * Send notification to all admins — used when user books appointment or requests plan
     */
    async notifyAdmins(
        type: INotification["type"],
        title: string,
        message: string,
        senderId: string,
        relatedId?: string
    ): Promise<void> {
        const allUsers = await this.userRepository.getAllUsers();
        const admins = allUsers.filter((u: any) => u.role === "admin");

        if (admins.length === 0) return;

        // Get sender details
        const sender = await this.userRepository.getUserById(senderId);
        if (!sender) return;

        const notifications = admins.map((admin: any) => ({
            recipientId: admin._id,
            type,
            title,
            message,
            metadata: { 
                senderName: sender.fullName, 
                senderProfilePicture: sender.profilePicture,
                relatedId 
            },
        }));

        await this.notificationRepository.createMany(notifications);
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string, userId: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            throw new HttpError(400, "Invalid notification ID format");
        }

        const notification = await this.notificationRepository.delete(notificationId);
        if (!notification) {
            throw new HttpError(404, "Notification not found");
        }
    }
}
