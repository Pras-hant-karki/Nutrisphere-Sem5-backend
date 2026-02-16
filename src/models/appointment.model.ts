import mongoose, { Document, Schema } from "mongoose";

export interface IAppointment extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    height: string;
    weight: string;
    job: string;
    trainingType: string;
    goal: string;
    preferredDate: string;
    preferredTime: string;
    country: string;
    specialRequest: string;
    status: "pending" | "approved" | "rescheduled" | "cancelled";
    adminResponse?: {
        message: string;
        respondedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema<IAppointment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        height: {
            type: String,
            required: [true, "Height is required"],
            trim: true,
        },
        weight: {
            type: String,
            required: [true, "Weight is required"],
            trim: true,
        },
        job: {
            type: String,
            default: "",
            trim: true,
        },
        trainingType: {
            type: String,
            required: [true, "Training type is required"],
            trim: true,
        },
        goal: {
            type: String,
            required: [true, "Goal is required"],
            trim: true,
        },
        preferredDate: {
            type: String,
            required: [true, "Preferred date is required"],
            trim: true,
        },
        preferredTime: {
            type: String,
            required: [true, "Preferred time is required"],
            trim: true,
        },
        country: {
            type: String,
            default: "",
            trim: true,
        },
        specialRequest: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "approved", "rescheduled", "cancelled"],
                message:
                    "Status must be 'pending', 'approved', 'rescheduled', or 'cancelled'",
            },
            default: "pending",
        },
        adminResponse: {
            message: {
                type: String,
                trim: true,
            },
            respondedAt: {
                type: Date,
            },
        },
    },
    { timestamps: true }
);

export const AppointmentModel = mongoose.model<IAppointment>(
    "Appointment",
    AppointmentSchema
);
