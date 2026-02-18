import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    recipientId: mongoose.Types.ObjectId;
    type: "new_post" | "new_session" | "trainer_update" | "appointment_request" | "plan_request";
    title: string;
    message: string;
    isRead: boolean;
    metadata?: {
        relatedId?: string;
        senderName?: string;
        senderProfilePicture?: string | null;
    };
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
    {
        recipientId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Recipient ID is required"],
        },
        type: {
            type: String,
            enum: ["new_post", "new_session", "trainer_update", "appointment_request", "plan_request"],
            required: [true, "Notification type is required"],
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        metadata: {
            relatedId: { type: String },
            senderName: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

export const NotificationModel = mongoose.model<INotification>(
    "Notification",
    NotificationSchema
);
