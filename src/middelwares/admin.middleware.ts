import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http-error";

/**
 * Middleware to verify if user is admin
 * Must be used AFTER authorizedMiddleware
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user;

        if (!user) {
            throw new HttpError(401, "Unauthorized - User not authenticated");
        }

        if (user.role !== "admin") {
            throw new HttpError(403, "Forbidden - Admin access required");
        }

        next();
    } catch (error) {
        next(error);
    }
}
