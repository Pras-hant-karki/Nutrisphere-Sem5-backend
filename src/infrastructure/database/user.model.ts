import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
    {
        fullName: { 
            type: String, 
            required: [true, "Full name is required"],
            trim: true,
            minlength: [2, "Full name must be at least 2 characters"],
            maxlength: [50, "Full name must not exceed 50 characters"]
        },
        email: { 
            type: String, 
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { 
            type: String, 
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false // Don't return password by default
        },
        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: "Role must be either 'user' or 'admin'"
            },
            default: 'user',
        },
        profilePicture: {
            type: String,
            default: null,
            trim: true
        },
        image: {
            type: String,
            default: null,
            trim: true
        },
        phone: {
            type: String,
            default: null,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastLogin: {
            type: Date,
            default: null
        },
        bio: {
            type: [
                {
                    type: {
                        type: String,
                        enum: ['text', 'image'],
                        required: true
                    },
                    content: {
                        type: String,
                        required: true
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            default: []
        }
    },
    { timestamps: true }
);

export interface IBioEntry {
    type: 'text' | 'image';
    content: string;
    createdAt: Date;
}

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    fullName: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    profilePicture?: string | null;
    image?: string | null;
    phone?: string | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    lastLogin: Date | null;
    bio: IBioEntry[];
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
