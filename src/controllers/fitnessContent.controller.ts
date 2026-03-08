import { Request, Response, NextFunction } from "express";
import { CreateFitnessContentDTO, UpdateFitnessContentDTO } from "../dtos/fitnessContent.dto";
import { FitnessContentService } from "../services/fitnessContent.service";
import { NotificationService } from "../services/notification.service";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

const fitnessContentService = new FitnessContentService();
const notificationService = new NotificationService();

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

            // Check if media file was uploaded (optional)
            let imagePath: string | undefined;
            let videoPath: string | undefined;
            if (req.file) {
                if (req.file.fieldname === 'fitnessVideo') {
                    videoPath = `/fitness_videos/${req.file.filename}`;
                } else {
                    imagePath = `/fitness_photos/${req.file.filename}`;
                }
            }

            // Prepare the data with optional media path
            const bodyData = {
                ...req.body,
                ...(imagePath && { image: imagePath }),
                ...(videoPath && { video: videoPath })
            };

            // Validate request body
            const data = CreateFitnessContentDTO.parse(bodyData);

            // Transform frontend fields to backend fields
            const transformedData = { ...data };
            if (data.category && !data.tags) {
                transformedData.tags = [data.category as any];
            }
            if (data.media && data.mediaType) {
                if (data.mediaType === 'image') {
                    transformedData.image = data.media;
                } else if (data.mediaType === 'video') {
                    transformedData.video = data.media;
                }
            }

            // Create content
            const result = await fitnessContentService.createContent(
                req.user._id,
                req.user.fullName,
                transformedData
            );

            // Send notification to all users about new post
            try {
                await notificationService.notifyAllUsers(
                    "new_post",
                    "New Fitness Post",
                    "New post created by Trainer, time to get new knowledge!",
                    req.user._id.toString(),
                    result._id?.toString()
                );
            } catch (notifError) {
                console.error("Failed to send notification:", notifError);
            }

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
     * Upload a photo only and return stored path (Admin only)
     */
    static async uploadPhoto(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.user?.role !== 'admin') {
                throw new HttpError(403, "Only admins can upload fitness photos");
            }

            if (!req.file) {
                throw new HttpError(400, "Image file is required");
            }

            const imagePath = `/fitness_photos/${req.file.filename}`;

            return res.status(201).json({
                success: true,
                message: 'Photo uploaded successfully',
                data: imagePath
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload a video only and return stored path (Admin only)
     */
    static async uploadVideo(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.user?.role !== 'admin') {
                throw new HttpError(403, "Only admins can upload fitness videos");
            }

            if (!req.file) {
                throw new HttpError(400, "Video file is required");
            }

            const videoPath = `/fitness_videos/${req.file.filename}`;

            return res.status(201).json({
                success: true,
                message: 'Video uploaded successfully',
                data: videoPath
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

            // Check if user is admin - if so, get all content, otherwise only published
            const isAdmin = req.user?.role === 'admin';
            const result = isAdmin 
                ? await fitnessContentService.getAllContent(page, limit)
                : await fitnessContentService.getAllPublishedContent(page, limit);

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

            // Transform frontend fields to backend fields
            const transformedData = { ...data };
            if (data.category && !data.tags) {
                transformedData.tags = [data.category as any];
            }
            if (data.media && data.mediaType) {
                if (data.mediaType === 'image') {
                    transformedData.image = data.media;
                } else if (data.mediaType === 'video') {
                    transformedData.video = data.media;
                }
            }

            // Update content
            const result = await fitnessContentService.updateContent(
                contentId,
                req.user._id,
                transformedData
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
