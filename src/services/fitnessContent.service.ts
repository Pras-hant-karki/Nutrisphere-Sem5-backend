import { CreateFitnessContentDTO, UpdateFitnessContentDTO } from "../dtos/fitnessContent.dto";
import { FitnessContentRepository } from "../repositories/fitnessContent.repository";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

export class FitnessContentService {
    private fitnessContentRepository: FitnessContentRepository;

    constructor() {
        this.fitnessContentRepository = new FitnessContentRepository();
    }

    /**
     * Create fitness content (Admin only)
     */
    async createContent(
        adminId: string | mongoose.Types.ObjectId,
        adminName: string,
        data: CreateFitnessContentDTO
    ) {
        const contentData = {
            ...data,
            adminId: typeof adminId === 'string' ? new mongoose.Types.ObjectId(adminId) : adminId,
            adminName
        };

        const createdContent = await this.fitnessContentRepository.createContent(contentData);
        return createdContent;
    }

    /**
     * Get single fitness content by ID
     */
    async getContentById(contentId: string | mongoose.Types.ObjectId) {
        const content = await this.fitnessContentRepository.getContentById(contentId);
        if (!content) {
            throw new HttpError(404, "Fitness content not found");
        }
    }

    /**
     * Get all published fitness content (For users/public)
     */
    async getAllPublishedContent(page: number = 1, limit: number = 10) {
        if (page < 1 || limit < 1) {
            throw new HttpError(400, "Page and limit must be greater than 0");
        }

        const result = await this.fitnessContentRepository.getAllPublishedContent(page, limit);
        return result;
    }

    /**
     * Get all fitness content (For admin)
     */
    async getAllContent(page: number = 1, limit: number = 10) {
        if (page < 1 || limit < 1) {
            throw new HttpError(400, "Page and limit must be greater than 0");
        }

        const result = await this.fitnessContentRepository.getAllContent(page, limit);
        return result;
    }

    /**
     * Get fitness content posted by specific admin
     */
    async getContentByAdmin(adminId: string | mongoose.Types.ObjectId, page: number = 1, limit: number = 10) {
        if (page < 1 || limit < 1) {
            throw new HttpError(400, "Page and limit must be greater than 0");
        }

        const content = await this.fitnessContentRepository.getContentByAdmin(adminId, page, limit);
        return content;
    }

    /**
     * Update fitness content (Admin only - must be content owner)
     */
    async updateContent(
        contentId: string | mongoose.Types.ObjectId,
        adminId: string | mongoose.Types.ObjectId,
        data: UpdateFitnessContentDTO
    ) {
        const content = await this.fitnessContentRepository.getContentById(contentId);
        if (!content) {
            throw new HttpError(404, "Fitness content not found");
        }

        const updatedContent = await this.fitnessContentRepository.updateContent(contentId, data);
        return updatedContent;
    }

    /**
     * Delete fitness content (Admin only - must be content owner)
     */
    async deleteContent(
        contentId: string | mongoose.Types.ObjectId,
        adminId: string | mongoose.Types.ObjectId
    ) {
        const content = await this.fitnessContentRepository.getContentById(contentId);
        if (!content) {
            throw new HttpError(404, "Fitness content not found");
        }

        const deletedContent = await this.fitnessContentRepository.deleteContent(contentId);
        return deletedContent;
    }

    /**
     * Get fitness content by tag (For users/public)
     */
    async getContentByTag(tag: string, page: number = 1, limit: number = 10) {
        if (page < 1 || limit < 1) {
            throw new HttpError(400, "Page and limit must be greater than 0");
        }

        const validTags = ['cardio', 'strength', 'yoga', 'flexibility', 'hiit', 'pilates', 'meditation', 'nutrition', 'other'];
        if (!validTags.includes(tag)) {
            throw new HttpError(400, `Invalid tag. Valid tags are: ${validTags.join(', ')}`);
        }

        const content = await this.fitnessContentRepository.getContentByTag(tag, page, limit);
        return content;
    }
}
