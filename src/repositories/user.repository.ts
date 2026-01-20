import { UserModel, IUser } from "../models/user.model";
import mongoose from "mongoose";

export class UserRepository {
    /**
     * Creates a new user in the database
     * @param userData - User data to create
     * @returns Created user document
     */
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        return await UserModel.create(userData);
    }

    /**
     * Finds user by email
     * @param email - User email address
     * @returns User document with password field included for authentication
     */
    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email }).select("+password");
    }

    /**
     * Finds user by ID
     * @param userId - MongoDB user ID
     * @returns User document (without password)
     */
    async getUserById(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
        return await UserModel.findById(userId);
    }

    /**
     * Updates user's last login timestamp
     * @param userId - MongoDB user ID
     * @returns Updated user document
     */
    async updateLastLogin(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { lastLogin: new Date() },
            { new: true }
        );
    }

    /**
     * Checks if email exists in database
     * @param email - Email to check
     * @returns true if email exists, false otherwise
     */
    async emailExists(email: string): Promise<boolean> {
        const user = await UserModel.findOne({ email });
        return !!user;
    }

    /**
     * Gets all users (for admin purposes)
     * @param page - Page number for pagination
     * @param limit - Number of users per page
     * @returns Array of users with pagination info
     */
    async getAllUsers(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const users = await UserModel.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        const total = await UserModel.countDocuments();
        
        return {
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Deactivates a user account
     * @param userId - MongoDB user ID
     * @returns Updated user document
     */
    async deactivateUser(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        );
    }

    /**
     * Activates a user account
     * @param userId - MongoDB user ID
     * @returns Updated user document
     */
    async activateUser(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { isActive: true },
            { new: true }
        );
    }

    /**
     * Deletes a user by ID
     * @param userId - MongoDB user ID
     * @returns Deleted user document
     */
    async deleteUser(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
        return await UserModel.findByIdAndDelete(userId);
    }
}
