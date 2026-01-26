import { Request, Response, NextFunction } from "express";
import { CreateFitnessContentDTO, UpdateFitnessContentDTO } from "../dtos/fitnessContent.dto";
import { FitnessContentService } from "../services/fitnessContent.service";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

const fitnessContentService = new FitnessContentService();

export class FitnessContentController {
    /**
     * Create fitness content (Admin only)
     */
    static async createContent(req: Request, res: Response, next: NextFunction) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'admin') {
                throw new HttpError(403, "Only admins can create fitness content");
            }

            // Validate request body
            const data = CreateFitnessContentDTO.parse(req.body);

            // Create content
            const result = await fitnessContentService.createContent(
                req.user._id,
                req.user.fullName,
                data
            );

            return res.status(201).json({
                success: true,
                message: "Fitness content created successfully",
                content: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all published fitness content (Users & Public)
     */
    static async getAllContent(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await fitnessContentService.getAllPublishedContent(page, limit);

            return res.status(200).json({
                success: true,
                message: "Fitness content fetched successfully",
                data: result.content,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get single fitness content by ID
     */
    static async getContentById(req: Request, res: Response, next: NextFunction) {
        try {
            const { contentId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                throw new HttpError(400, "Invalid content ID");
            }

            const content = await fitnessContentService.getContentById(contentId);

            return res.status(200).json({
                success: true,
                message: "Fitness content fetched successfully",
                content
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get fitness content by tag (Users & Public)
     */
    static async getContentByTag(req: Request, res: Response, next: NextFunction) {
        try {
            const { tag } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const content = await fitnessContentService.getContentByTag(tag, page, limit);

            return res.status(200).json({
                success: true,
                message: `Fitness content with tag '${tag}' fetched successfully`,
                data: content,
                pagination: {
                    page,
                    limit
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get fitness content posted by specific admin
     */
    static async getContentByAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { adminId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!mongoose.Types.ObjectId.isValid(adminId)) {
                throw new HttpError(400, "Invalid admin ID");
            }

            const content = await fitnessContentService.getContentByAdmin(adminId, page, limit);

            return res.status(200).json({
                success: true,
                message: "Fitness content fetched successfully",
                data: content,
                pagination: {
                    page,
                    limit
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update fitness content (Admin only - owner of content)
     */
    static async updateContent(req: Request, res: Response, next: NextFunction) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'admin') {
                throw new HttpError(403, "Only admins can update fitness content");
            }

            const { contentId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                throw new HttpError(400, "Invalid content ID");
            }

            // Validate request body
            const data = UpdateFitnessContentDTO.parse(req.body);

            // Update content
            const result = await fitnessContentService.updateContent(
                contentId,
                req.user._id,
                data
            );

            return res.status(200).json({
                success: true,
                message: "Fitness content updated successfully",
                content: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete fitness content (Admin only - owner of content)
     */
    static async deleteContent(req: Request, res: Response, next: NextFunction) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'admin') {
                throw new HttpError(403, "Only admins can delete fitness content");
            }

            const { contentId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                throw new HttpError(400, "Invalid content ID");
            }

            // Delete content
            const result = await fitnessContentService.deleteContent(contentId, req.user._id);

            return res.status(200).json({
                success: true,
                message: "Fitness content deleted successfully",
                content: result
            });
        } catch (error) {
            next(error);
        }
    }
}
