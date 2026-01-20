import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";

const userRepository = new UserRepository();

export class UserService {
  private generateToken(userId: any, email: string, role: string): string {
    return jwt.sign(
      {
        id: userId,
        email,
        role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
  }

  async createUser(data: CreateUserDTO) {
    try {
      const existingUser = await userRepository.getUserByEmail(data.email);
      if (existingUser) {
        throw new HttpError(409, "This email is already registered");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await userRepository.createUser({
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: "user",
        isActive: true, // ✅ FIX
      });

      const token = this.generateToken(user._id, user.email, user.role);

      return {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error: any) {
      if (error.statusCode) throw error;
      if (error.code === 11000) {
        throw new HttpError(409, "This email is already registered");
      }
      throw new HttpError(500, "Error creating account");
    }
  }

  async loginUser(data: LoginUserDTO) {
    try {
      const user = await userRepository.getUserByEmail(data.email);
      if (!user) {
        throw new HttpError(401, "Invalid email or password");
      }

      // if (!user.isActive) {
      //   throw new HttpError(403, "Account is disabled");
      // }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!isPasswordValid) {
        throw new HttpError(401, "Invalid email or password");
      }

      const token = this.generateToken(user._id, user.email, user.role);
      await userRepository.updateLastLogin(user._id);

      return {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        message: "Login successful",
      };
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new HttpError(500, "Login failed");
    }
  }
}
