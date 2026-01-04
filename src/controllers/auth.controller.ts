import { Request, Response } from "express";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserService } from "../services/admin/user.service";
import z from "zod";

const userService = new UserService();

export class AuthController {

    async register(req: Request, res: Response) {
        try {
            const parsed = CreateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsed.error)
                });
            }

            const user = await userService.createUser(parsed.data);
            return res.status(201).json({ success: true, data: user });

        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsed = LoginUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsed.error)
                });
            }

            const result = await userService.loginUser(parsed.data);
            return res.status(200).json({ success: true, ...result });

        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message
            });
        }
    }
}
