import mongoose, { Document, Schema } from "mongoose";

export interface IFitnessContent extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    content: string; // Main content/body
    image?: string; // Image URL
    video?: string; // Video URL
    adminName: string; // Admin's name for quick access
    tags?: string[]; // Tags like 'cardio', 'strength', 'yoga', etc.
    duration?: number;
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
            minlength: [20, "Description must be at least 20 characters"],
            maxlength: [1000, "Description must not exceed 1000 characters"]
        },
        content: {
            type: String,
            default: null,
            minlength: [10, "Content must be at least 10 characters"]
        },
        image: {
            type: String,
            default: null,
            required: function(this: IFitnessContent) {
                return !this.video;
            },
            trim: true
        },
        video: {
            type: String,
            default: null,
            required: function(this: IFitnessContent) {
                return !this.image;
            },
            trim: true
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
        duration: {
            type: Number,
            default: null, // in minutes
            min: [1, "Duration must be at least 1 minute"]
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
