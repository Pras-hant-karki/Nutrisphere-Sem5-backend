import mongoose, { Document, Schema } from "mongoose";

export interface IPlanRequest extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    requestType: "diet" | "workout";
    height: string;
    weight: string;
    job: string;
    foodAllergy: string;
    dietType: "veg" | "non-veg";
    medicalCondition: string;
    trainingType: string;
    goal: string;
    specialRequest: string;
    status: "pending" | "approved" | "rejected";
    adminResponse?: {
        type: "file" | "link";
        url: string;
        respondedAt: Date;
    };
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PlanRequestSchema: Schema = new Schema<IPlanRequest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        requestType: {
            type: String,
            enum: {
                values: ["diet", "workout"],
                message: "Request type must be either 'diet' or 'workout'",
            },
            required: [true, "Request type is required"],
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
        foodAllergy: {
            type: String,
            default: "None",
            trim: true,
        },
        dietType: {
            type: String,
            enum: {
                values: ["veg", "non-veg"],
                message: "Diet type must be either 'veg' or 'non-veg'",
            },
            required: [true, "Diet type is required"],
        },
        medicalCondition: {
            type: String,
            default: "No",
            trim: true,
        },
        trainingType: {
            type: String,
            default: "",
            trim: true,
        },
        goal: {
            type: String,
            required: [true, "Goal is required"],
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
                values: ["pending", "approved", "rejected"],
                message: "Status must be 'pending', 'approved', or 'rejected'",
            },
            default: "pending",
        },
        adminResponse: {
            type: {
                type: String,
                enum: ["file", "link"],
            },
            url: {
                type: String,
                trim: true,
            },
            respondedAt: {
                type: Date,
            },
        },
        rejectionReason: {
            type: String,
            default: null,
            trim: true,
        },
    },
    { timestamps: true }
);

export const PlanRequestModel = mongoose.model<IPlanRequest>(
    "PlanRequest",
    PlanRequestSchema
);
