import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { HttpError } from "../errors/http-error";

const adminService = new AdminService();

export class AdminController {
    /**
     * POST /api/admin/users
     * Create a new user (with image upload support)
     */
    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { fullName, email, password, role, phone } = req.body;
            const image = req.file ? `/uploads/${req.file.filename}` : undefined;

            // Validate required fields
            if (!fullName || !email || !password || !role) {
                throw new HttpError(400, "Missing required fields: fullName, email, password, role");
            }

            const result = await adminService.createUser(
                fullName,
                email,
                password,
                role,
                phone,
                image
            );

            return res.status(201).json({
                success: true,
                message: result.message,
                user: result.user,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/users
     * Get all users
     */
    static async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await adminService.getAllUsers();

            return res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data: users,
                total: users.length,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/users/:id
     * Get user by ID
     */
    static async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await adminService.getUserById(id);

            return res.status(200).json({
                success: true,
                message: "User retrieved successfully",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/users/:id
     * Update user by ID (with image upload support)
     */
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { fullName, email, role, phone, isActive } = req.body;
            const image = req.file ? `/uploads/${req.file.filename}` : undefined;

            const result = await adminService.updateUser(
                id,
                fullName,
                email,
                role,
                phone,
                image,
                isActive
            );

            return res.status(200).json({
                success: true,
                message: result.message,
                user: result.user,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/admin/users/:id
     * Delete user by ID
     */
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await adminService.deleteUser(id);

            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }
}
