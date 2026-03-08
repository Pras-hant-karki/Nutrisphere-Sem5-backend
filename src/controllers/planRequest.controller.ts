import { Request, Response, NextFunction } from "express";
import { PlanRequestService } from "../services/planRequest.service";
import { HttpError } from "../errors/http-error";

const planRequestService = new PlanRequestService();

export class PlanRequestController {
    /**
     * POST /api/plan-requests
     * User submits a new plan request
     */
    static async createRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)._id.toString();
            const {
                requestType,
                height,
                weight,
                job,
                foodAllergy,
                dietType,
                medicalCondition,
                trainingType,
                goal,
                specialRequest,
            } = req.body;

            if (!requestType || !height || !weight || !dietType || !goal) {
                throw new HttpError(
                    400,
                    "Missing required fields: requestType, height, weight, dietType, goal"
                );
            }

            const result = await planRequestService.createRequest(userId, {
                requestType,
                height,
                weight,
                job,
                foodAllergy,
                dietType,
                medicalCondition,
                trainingType,
                goal,
                specialRequest,
            });

            return res.status(201).json({
                success: true,
                message: result.message,
                data: result.request,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/plan-requests/my-requests
     * User gets their own plan requests
     */
    static async getMyRequests(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)._id.toString();
            const requests = await planRequestService.getUserRequests(userId);

            return res.status(200).json({
                success: true,
                data: requests,
                total: requests.length,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/plan-requests
     * Admin gets all plan requests
     */
    static async getAllRequests(req: Request, res: Response, next: NextFunction) {
        try {
            const pendingOnly = req.query.pending === "true";
            const requests = await planRequestService.getAllRequests(pendingOnly);

            return res.status(200).json({
                success: true,
                data: requests,
                total: requests.length,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/plan-requests/:id
     * Admin gets a single plan request by ID
     */
    static async getRequestById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const request = await planRequestService.getRequestById(id);

            return res.status(200).json({
                success: true,
                data: request,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/plan-requests/:id/approve
     * Admin approves a plan request (upload file or provide link)
     */
    static async approveRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            let responseType: "file" | "link";
            let url: string;

            if (req.file) {
                // File was uploaded
                responseType = "file";
                url = `/uploads/plan_files/${req.file.filename}`;
                // url = `/uploads/${req.file.filename}`;
            } else if (req.body.link) {
                // Link was provided
                responseType = "link";
                url = req.body.link;
            } else {
                throw new HttpError(400, "Either a file or a link must be provided");
            }

            const result = await planRequestService.approveRequest(id, responseType, url);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.request,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/plan-requests/:id/reject
     * Admin rejects a plan request with a reason
     */
    static async rejectRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            if (!reason || reason.trim().length === 0) {
                throw new HttpError(400, "Rejection reason is required");
            }

            const result = await planRequestService.rejectRequest(id, reason);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.request,
            });
        } catch (error) {
            next(error);
        }
    }
}
