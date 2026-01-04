import { CreateUserDto } from "../../dtos/user.dto";
import z, { success } from "zod";
import { Request, Response } from "express";
import { AuthService } from "../../services/auth.service";
let authService = new AuthService();

export class AdminUserController {
    async createUser(req: Request, res: Response) {
        // 1. Validate
        // 2. Call service - reuse AuthService.registerUser
        // 3. Handle response
        // handle errors and success responses
        // api path: /api/admin/users (POST)
        // make new route routes/admin/user.route.ts
        // use prefix in index /api/admin/users
        try {
            const parsedResult = CreateUserDto.safeParse(req.body);
            if (!parsedResult.success) {
                return res.status(400).json({
                    success: false, message: z.prettifyError(parsedResult.error)
                });
            }
            const newUser = await authService.registerUser(parsedResult.data);
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: newUser
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }

    }
}