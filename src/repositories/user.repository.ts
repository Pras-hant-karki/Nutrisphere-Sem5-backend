import { UserModel, IUser } from "../models/user.model";
import mongoose from "mongoose";

export interface IUserRepository {
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserById(userId: string | mongoose.Types.ObjectId): Promise<IUser | null>;
    emailExists(email: string): Promise<boolean>;
    getAllUsers(page: number, limit: number): Promise<any>;
    deleteUser(userId: string | mongoose.Types.ObjectId): Promise<IUser | null>;
    updateProfilePicture(userId: string | mongoose.Types.ObjectId, profilePictureUrl: string): Promise<IUser | null>;
    getProfilePicture(userId: string | mongoose.Types.ObjectId): Promise<string | null>;
    updateUserByEmail(email: string, userData: Partial<IUser>): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {

    // add profile picture
    async updateProfilePicture(userId: string | mongoose.Types.ObjectId, profilePictureUrl: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { profilePicture: profilePictureUrl },
            { new: true }
        );
    }

    async getProfilePicture(userId: string | mongoose.Types.ObjectId): Promise<string | null> {
        const user = await UserModel.findById(userId).select('profilePicture');
        return user?.profilePicture || null;
    }

    //Creates a new user in the database 
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        return await UserModel.create(userData);
    }

    //Finds user by email
    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email }).select("+password");
    }

    //Checks if email exists in database
    async emailExists(email: string): Promise<boolean> {
        const user = await UserModel.findOne({ email });
        return !!user;
    }

    // Gets all users (for admin purposes)
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }

    //Deletes a user by email
    async deleteUser(email: string): Promise<IUser | null> {
        return await UserModel.findOneAndDelete({ email });
    }

    //Updates a user by email
    async updateUserByEmail(email: string, userData: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findOneAndUpdate(
            { email },
            userData,
            { new: true }
        );
    }

    //Finds user by ID
    async getUserById(
        userId: string | mongoose.Types.ObjectId
            ): Promise<IUser | null> {
        return await UserModel.findById(userId);
    }
}
