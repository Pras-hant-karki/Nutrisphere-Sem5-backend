import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { NotificationService } from "../services/notification.service";
import { HttpError } from "../errors/http-error";

const adminService = new AdminService();
const notificationService = new NotificationService();

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

    /**
     * PUT /api/admin/bio
     * Save bio entries for the logged-in admin
     */
    static async saveBio(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)._id.toString();
            const { bio } = req.body;

            if (!bio || !Array.isArray(bio)) {
                throw new HttpError(400, "Bio must be an array of entries");
            }

            const result = await adminService.saveBio(userId, bio);

            // Notify all users about trainer bio update
            try {
                await notificationService.notifyAllUsers(
                    "trainer_update",
                    "Trainer Profile Updated",
                    "Trainer details updated, get to know more about your Trainer!",
                    userId
                );
            } catch (notifError) {
                console.error("Failed to send notification:", notifError);
            }

            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/bio
     * Get bio entries for the logged-in admin
     */
    static async getBio(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)._id.toString();
            const bio = await adminService.getBio(userId);

            return res.status(200).json({
                success: true,
                data: bio,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/admin/bio/upload-image
     * Upload an image for a bio entry
     */
    static async uploadBioImage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw new HttpError(400, "No image file provided");
            }

            const imageUrl = `/uploads/${req.file.filename}`;

            return res.status(200).json({
                success: true,
                message: "Image uploaded successfully",
                data: { imageUrl },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/trainer-info
     * Get trainer info (public for users)
     */
    static async getTrainerInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const trainer = await adminService.getTrainerInfo();

            return res.status(200).json({
                success: true,
                data: trainer,
            });
        } catch (error) {
            next(error);
        }
    }
}
