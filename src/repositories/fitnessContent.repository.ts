import { FitnessContentModel, IFitnessContent } from "../models/fitnessContent.model";
import mongoose from "mongoose";

export interface IFitnessContentRepository {
    createContent(contentData: Partial<IFitnessContent>): Promise<IFitnessContent>;
    getAllPublishedContent(page: number, limit: number): Promise<{ content: IFitnessContent[], total: number }>;
    getContentByAdmin(adminId: string | mongoose.Types.ObjectId, page: number, limit: number): Promise<IFitnessContent[]>;
    updateContent(contentId: string | mongoose.Types.ObjectId, contentData: Partial<IFitnessContent>): Promise<IFitnessContent | null>;
    deleteContent(contentId: string | mongoose.Types.ObjectId): Promise<IFitnessContent | null>;
    getContentByTag(tag: string, page: number, limit: number): Promise<IFitnessContent[]>;
}

export class FitnessContentRepository implements IFitnessContentRepository {

    // Create new fitness content (Admin only)
    async createContent(contentData: Partial<IFitnessContent>): Promise<IFitnessContent> {
        return await FitnessContentModel.create(contentData);
    }

    // Get single content by ID
    async getContentById(contentId: string | mongoose.Types.ObjectId): Promise<IFitnessContent | null> {
        return await FitnessContentModel.findById(contentId).populate('adminId', 'fullName email profilePicture');
    }

    // Get all published content with pagination
    async getAllPublishedContent(page: number, limit: number): Promise<{ content: IFitnessContent[], total: number }> {
        const skip = (page - 1) * limit;
        const content = await FitnessContentModel.find({ isPublished: true })
            .populate('adminId', 'fullName email profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await FitnessContentModel.countDocuments({ isPublished: true });
        
        return { content, total };
    }

    // Get content posted by specific admin with pagination
    async getContentByAdmin(adminId: string | mongoose.Types.ObjectId, page: number, limit: number): Promise<IFitnessContent[]> {
        const skip = (page - 1) * limit;
        return await FitnessContentModel.find({ adminId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    // Update content by ID
    async updateContent(contentId: string | mongoose.Types.ObjectId, contentData: Partial<IFitnessContent>): Promise<IFitnessContent | null> {
        return await FitnessContentModel.findByIdAndUpdate(
            contentId,
            contentData,
            { new: true }
        );
    }

    // Delete content by ID
    async deleteContent(contentId: string | mongoose.Types.ObjectId): Promise<IFitnessContent | null> {
        return await FitnessContentModel.findByIdAndDelete(contentId);
    }

    // Get content by tag with pagination
    async getContentByTag(tag: string, page: number, limit: number): Promise<IFitnessContent[]> {
        const skip = (page - 1) * limit;
        return await FitnessContentModel.find({ tags: tag, isPublished: true })
            .populate('adminId', 'fullName email profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }
}
