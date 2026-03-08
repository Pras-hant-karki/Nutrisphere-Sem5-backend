import { PlanRequestModel, IPlanRequest } from "../models/planRequest.model";
import mongoose from "mongoose";

export class PlanRequestRepository {
    /**
     * Create a new plan request
     */
    async create(data: Partial<IPlanRequest>): Promise<IPlanRequest> {
        return await PlanRequestModel.create(data);
    }

    /**
     * Get all plan requests (for admin) with user details populated
     */
    async getAll(): Promise<IPlanRequest[]> {
        return await PlanRequestModel.find()
            .populate("userId", "fullName email phone profilePicture image")
            .sort({ createdAt: -1 });
    }

    /**
     * Get all pending plan requests (for admin)
     */
    async getAllPending(): Promise<IPlanRequest[]> {
        return await PlanRequestModel.find({ status: "pending" })
            .populate("userId", "fullName email phone profilePicture image")
            .sort({ createdAt: -1 });
    }

    /**
     * Get plan requests by user ID (for user to see their own requests)
     */
    async getByUserId(userId: string | mongoose.Types.ObjectId): Promise<IPlanRequest[]> {
        return await PlanRequestModel.find({ userId })
            .sort({ createdAt: -1 });
    }

    /**
     * Get a single plan request by ID
     */
    async getById(requestId: string | mongoose.Types.ObjectId): Promise<IPlanRequest | null> {
        return await PlanRequestModel.findById(requestId)
            .populate("userId", "fullName email phone profilePicture image");
    }

    /**
     * Approve a plan request (upload file or link)
     */
    async approve(
        requestId: string | mongoose.Types.ObjectId,
        responseType: "file" | "link",
        url: string
    ): Promise<IPlanRequest | null> {
        return await PlanRequestModel.findByIdAndUpdate(
            requestId,
            {
                status: "approved",
                adminResponse: {
                    type: responseType,
                    url,
                    respondedAt: new Date(),
                },
            },
            { new: true }
        );
    }

    /**
     * Reject a plan request with a reason
     */
    async reject(
        requestId: string | mongoose.Types.ObjectId,
        reason: string
    ): Promise<IPlanRequest | null> {
        return await PlanRequestModel.findByIdAndUpdate(
            requestId,
            {
                status: "rejected",
                rejectionReason: reason,
                adminResponse: {
                    type: "link", // dummy
                    url: "", // dummy
                    respondedAt: new Date(),
                },
            },
            { new: true }
        );
    }

    /**
     * Delete a plan request permanently
     */
    async delete(requestId: string | mongoose.Types.ObjectId): Promise<IPlanRequest | null> {
        return await PlanRequestModel.findByIdAndDelete(requestId);
    }
}
