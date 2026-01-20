import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config";
import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";

let userRepository = new UserRepository();

declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser
        }
    }
}

/**
 * Middleware to verify JWT token and attach user to request
 * Must be used before accessing req.user in routes
 */
export async function authorizedMiddelWare(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError(401, "Unauthorized - No Bearer Token provided");
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        if (!token) {
            throw new HttpError(401, "Unauthorized - Missing Token");
        }
        
        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;
        
        if (!decoded || !decoded.id) {
            throw new HttpError(401, "Unauthorized - Invalid Token");
        }
        
        const user = await userRepository.getUserById(decoded.id);
        
        if (!user) {
            throw new HttpError(401, "Unauthorized - User Not Found");
        }

        if (!user.isActive) {
            throw new HttpError(403, "Account is disabled");
        }
        
        req.user = user;
        return next();
    } catch (err: Error | any) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Unauthorized"
        });
    }
}

/**
 * Middleware to verify admin role
 * Must be used after authorizedMiddelWare
 */
export async function adminMiddelWare(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized - User not found in request");
        }

        if (req.user.role !== 'admin') {
            throw new HttpError(403, "Forbidden - Admin access required");
        }

        return next();
    } catch (err: Error | any) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Forbidden"
        });
    }
}