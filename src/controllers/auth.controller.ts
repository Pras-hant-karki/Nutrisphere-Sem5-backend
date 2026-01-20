import { Request, Response, NextFunction } from "express";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const data = CreateUserDTO.parse(req.body);

      // Create user
      const result = await userService.createUser(data);

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const data = LoginUserDTO.parse(req.body);

      // Authenticate user
      const result = await userService.loginUser(data);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
