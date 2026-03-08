import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterUserDTO, LoginUserDTO } from "../../dtos/user.dto";
import { RegisterUserUseCase } from "../../domain/usecases/register-user.usecase";
import { LoginUserUseCase } from "../../domain/usecases/login-user.usecase";
import { MongoUserRepository } from "../../infrastructure/database/mongo-user.repository";
import { JWT_SECRET } from "../../config";
import { HttpError } from "../../errors/http-error";
import { RequestPasswordResetDTO, ResetPasswordDTO } from "../../dtos/user.dto";
import { UserService } from "../../services/user.service";

// Dependency injection - in a real app, use a DI container
const userRepository = new MongoUserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const userService = new UserService();

export class UserController {
  /**
   * Get authenticated user profile
   */
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = req.user as any;
      const userId = (currentUser?.id || currentUser?._id)?.toString();

      if (!userId) {
        throw new HttpError(401, "Unauthorized - User not authenticated");
      }

      const user = await userRepository.getUserById(userId);
      if (!user) {
        throw new HttpError(404, "User not found");
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const data = RegisterUserDTO.parse(req.body);

      // Hash password (infrastructure concern)
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const request = {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
      };

      // Execute use case
      const result = await registerUserUseCase.execute(request);

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: result.user,
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

      // Execute use case to get user
      const result = await loginUserUseCase.execute({
        email: data.email,
        password: '', // Password check done below
      });

      // Verify password (infrastructure concern)
      const isValidPassword = await bcrypt.compare(data.password, result.user.password);
      if (!isValidPassword) {
        throw new HttpError(401, "Invalid credentials");
      }

      // Generate JWT token (infrastructure concern)
      const payload = {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

      return res.status(200).json({
        success: true,
        token,
        user: result.user,
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
      const profilePictureUrl = `/profile_pictures/${req.file.filename}`;

      // Update profile picture in database
      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        throw new HttpError(404, "User not found");
      }
      const updatedUser = await userRepository.updateUser(user.id, {
        profilePicture: profilePictureUrl,
        image: profilePictureUrl,
      });

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

      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        throw new HttpError(404, "User not found");
      }

      return res.status(200).json({
        success: true,
        profilePictureUrl: user.profilePicture,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/auth/:id
   * Update user profile (image, fullName, phone, etc)
   * Only logged-in user can update their own profile unless admin
   */
  static async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      const { fullName, phone } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;
      const profilePicture = req.body?.profilePicture;

      if (!currentUser) {
        throw new HttpError(401, "Unauthorized - User not authenticated");
      }

      const currentUserId = ((currentUser as any)?.id || (currentUser as any)?._id)?.toString();

      // Check authorization: user can only update their own profile (unless admin)
      if (currentUserId !== id && currentUser.role !== "admin") {
        throw new HttpError(403, "Forbidden - Can only update your own profile");
      }

      const updateData: Partial<any> = {};
      if (fullName) updateData.fullName = fullName;
      if (phone) updateData.phone = phone;
      if (typeof profilePicture === "string" && profilePicture.trim()) {
        updateData.profilePicture = profilePicture.trim();
      }
      if (image) {
        updateData.image = image;
        updateData.profilePicture = image;
      }

      const updatedUser = await userRepository.updateUser(id, updateData);

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async requestPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = RequestPasswordResetDTO.parse(req.body);
      await userService.sendResetPasswordEmail(data.email);

      return res.status(200).json({
        success: true,
        message: "If this email exists, a reset link has been sent.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = ResetPasswordDTO.parse(req.body);
      await userService.resetPassword(data.token, data.password);

      return res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
