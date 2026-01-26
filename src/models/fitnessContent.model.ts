import mongoose, { Document, Schema } from "mongoose";

export interface IFitnessContent extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    content: string; // Main content/body
    image?: string; // Image URL
    video?: string; // Video URL
    adminId: mongoose.Types.ObjectId; // Reference to admin user
    adminName: string; // Admin's name for quick access
    tags?: string[]; // Tags like 'cardio', 'strength', 'yoga', etc.
    difficulty?: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level
    duration?: number; // Duration in minutes
    likes: number;
    views: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FitnessContentSchema: Schema = new Schema<IFitnessContent>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            minlength: [5, "Title must be at least 5 characters"],
            maxlength: [100, "Title must not exceed 100 characters"]
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            minlength: [10, "Description must be at least 10 characters"],
            maxlength: [500, "Description must not exceed 500 characters"]
        },
        content: {
            type: String,
            required: [true, "Content is required"],
            minlength: [20, "Content must be at least 20 characters"]
        },
        image: {
            type: String,
            default: null,
            trim: true
        },
        video: {
            type: String,
            default: null,
            trim: true
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Admin ID is required"]
        },
        adminName: {
            type: String,
            required: [true, "Admin name is required"],
            trim: true
        },
        tags: {
            type: [String],
            default: [],
            enum: ['cardio', 'strength', 'yoga', 'flexibility', 'hiit', 'pilates', 'meditation', 'nutrition', 'other']
        },
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        duration: {
            type: Number,
            default: null, // in minutes
            min: [1, "Duration must be at least 1 minute"]
        },
        likes: {
            type: Number,
            default: 0,
            min: [0, "Likes cannot be negative"]
        },
        views: {
            type: Number,
            default: 0,
            min: [0, "Views cannot be negative"]
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const FitnessContentModel = mongoose.model<IFitnessContent>(
    "FitnessContent",
    FitnessContentSchema
);
