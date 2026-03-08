import { IPlanRequest } from "../models/planRequest.model";
import { PlanRequestRepository } from "../repositories/planRequest.repository";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

export class PlanRequestService {
    private planRequestRepository: PlanRequestRepository;

    constructor() {
        this.planRequestRepository = new PlanRequestRepository();
    }

    /**
     * User submits a new plan request
     */
    async createRequest(
        userId: string,
        data: {
            requestType: "diet" | "workout";
            height: string;
            weight: string;
            job?: string;
            foodAllergy?: string;
            dietType: "veg" | "non-veg";
            medicalCondition?: string;
            trainingType?: string;
            goal: string;
            specialRequest?: string;
        }
    ): Promise<{ request: IPlanRequest; message: string }> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }

        const newRequest = await this.planRequestRepository.create({
            userId: new mongoose.Types.ObjectId(userId),
            ...data,
        });

        return {
            request: newRequest,
            message: "Plan request submitted successfully",
        };
    }

    /**
     * Admin gets all plan requests (optionally only pending)
     */
    async getAllRequests(pendingOnly: boolean = false): Promise<IPlanRequest[]> {
        if (pendingOnly) {
            return await this.planRequestRepository.getAllPending();
        }
        return await this.planRequestRepository.getAll();
    }

    /**
     * Admin gets a single plan request by ID
     */
    async getRequestById(requestId: string): Promise<IPlanRequest> {
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            throw new HttpError(400, "Invalid request ID format");
        }

        const request = await this.planRequestRepository.getById(requestId);
        if (!request) {
            throw new HttpError(404, "Plan request not found");
        }

        return request;
    }

    /**
     * User gets their own plan requests
     */
    async getUserRequests(userId: string): Promise<IPlanRequest[]> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }

        return await this.planRequestRepository.getByUserId(userId);
    }

    /**
     * Admin approves a plan request by uploading a file or providing a link
     */
    async approveRequest(
        requestId: string,
        responseType: "file" | "link",
        url: string
    ): Promise<{ request: IPlanRequest; message: string }> {
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            throw new HttpError(400, "Invalid request ID format");
        }

        const existing = await this.planRequestRepository.getById(requestId);
        if (!existing) {
            throw new HttpError(404, "Plan request not found");
        }

        if (existing.status !== "pending") {
            throw new HttpError(400, "Only pending requests can be approved");
        }

        const updated = await this.planRequestRepository.approve(
            requestId,
            responseType,
            url
        );

        return {
            request: updated!,
            message: "Plan request approved successfully",
        };
    }

    /**
     * Admin rejects a plan request with a mandatory reason
     */
    async rejectRequest(
        requestId: string,
        reason: string
    ): Promise<{ request: IPlanRequest; message: string }> {
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            throw new HttpError(400, "Invalid request ID format");
        }

        if (!reason || reason.trim().length === 0) {
            throw new HttpError(400, "Rejection reason is required");
        }

        const existing = await this.planRequestRepository.getById(requestId);
        if (!existing) {
            throw new HttpError(404, "Plan request not found");
        }

        if (existing.status !== "pending") {
            throw new HttpError(400, "Only pending requests can be rejected");
        }

        const updated = await this.planRequestRepository.reject(requestId, reason.trim());

        return {
            request: updated!,
            message: "Plan request rejected",
        };
    }
}
