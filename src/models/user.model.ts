import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

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
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
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
        }
    },
    { timestamps: true }
);

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    isActive: Boolean;
    lastLogin: Date | null;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
