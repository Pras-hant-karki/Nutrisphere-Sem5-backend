import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

export class AdminService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * Create a new user (admin only)
     * Hashes password and saves user
     */
    async createUser(
        fullName: string,
        email: string,
        password: string,
        role: 'user' | 'admin',
        phone?: string,
        image?: string
    ): Promise<{ user: IUser; message: string }> {
        // Check if email exists
        const emailExists = await this.userRepository.emailExists(email);
        if (emailExists) {
            throw new HttpError(409, "Email already exists");
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create user
        const newUser = await this.userRepository.createUser({
            fullName,
            email,
            password: hashedPassword,
            role,
            phone,
            image,
            isActive: true,
        });

        return {
            user: newUser,
            message: `User ${fullName} created successfully`,
        };
    }

    /**
     * Get all users (admin only)
     */
    async getAllUsers(): Promise<IUser[]> {
        const users = await this.userRepository.getAllUsers();
        return users;
    }

    /**
     * Get user by ID (admin only)
     */
    async getUserById(userId: string): Promise<IUser> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }

        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        return user;
    }

    /**
     * Update user by ID (admin only)
     * Can update: fullName, email, role, phone, image, isActive
     */
    async updateUser(
        userId: string,
        fullName?: string,
        email?: string,
        role?: 'user' | 'admin',
        phone?: string,
        image?: string,
        isActive?: boolean
    ): Promise<{ user: IUser; message: string }> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }

        const userExists = await this.userRepository.getUserById(userId);
        if (!userExists) {
            throw new HttpError(404, "User not found");
        }

        // If email is being updated, check if new email is unique
        if (email && email !== userExists.email) {
            const emailExists = await this.userRepository.emailExists(email);
            if (emailExists) {
                throw new HttpError(409, "Email already exists");
            }
        }

        // Build update object with only provided fields
        const updateData: Partial<IUser> = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (phone !== undefined) updateData.phone = phone;
        if (image !== undefined) updateData.image = image;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedUser = await this.userRepository.updateUserById(userId, updateData);

        return {
            user: updatedUser!,
            message: "User updated successfully",
        };
    }

    /**
     * Delete user by ID (admin only)
     */
    async deleteUser(userId: string): Promise<{ message: string }> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }

        const userExists = await this.userRepository.getUserById(userId);
        if (!userExists) {
            throw new HttpError(404, "User not found");
        }

        await this.userRepository.deleteUser(userId);

        return {
            message: `User deleted successfully`,
        };
    }
}
