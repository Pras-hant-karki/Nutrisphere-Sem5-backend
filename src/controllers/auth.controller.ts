import { Request, Response, NextFunction } from "express";
import { RegisterUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { HttpError } from "../errors/http-error";

const userService = new UserService();

export class UserController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const data = RegisterUserDTO.parse(req.body);

      // Create user
      const result = await userService.registerUser(data);

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
      const result = await userService.LoginUser(data);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload profile picture for user or admin
   * Both users and admins can upload their profile picture
   */
  static async uploadProfilePicture(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.file) {
        throw new HttpError(400, "No file uploaded");
      }

      const email = req.user?.email;
      if (!email) {
        throw new HttpError(401, "Unauthorized - User email not found");
      }

      // Get the file path relative to uploads folder
      const profilePictureUrl = `/fitness_photos/${req.file.filename}`;

      // Update profile picture in database
      const updatedUser = await userService.updateProfilePicture(
        email,
        profilePictureUrl
      );

      return res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        profilePictureUrl: profilePictureUrl,
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile picture for user or admin
   */
  static async getProfilePicture(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const email = req.user?.email;
      if (!email) {
        throw new HttpError(401, "Unauthorized - User email not found");
      }

      const profilePictureUrl = await userService.getProfilePicture(email);

      return res.status(200).json({
        success: true,
        profilePictureUrl: profilePictureUrl,
      });
    } catch (error) {
      next(error);
    }
  }
}
