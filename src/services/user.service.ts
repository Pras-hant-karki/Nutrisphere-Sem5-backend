import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";
import { RegisterUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { email } from "zod";

let userRepository = new UserRepository();

export class UserService {
  async registerUser(data: RegisterUserDTO) {
    // logic to register user, duplicate check, hash password
    const existingEmail = await userRepository.getUserByEmail(data.email);
    if (existingEmail) {
      throw new HttpError(403, "Email already registered.");
    }

    // donot save plain text password, hash the password
    const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
    data.password = hashedPassword; // replace plain text with hashed password

    const newUser = await userRepository.createUser(data);
    return newUser;
  }

  async LoginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found.");
    }
    const validPassword = await bcryptjs.compare(data.password, user.password);
    // plain text, hashed, not data.password == user.password
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    // generate JWT token
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    }; // data to be stored in token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    return { token, user };
  }

      async getUserByEmail(email: string){
        if(!email){
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(email: string, data: UpdateUserDTO){
        if(data.email && data.email !== email){
            const emailExists = await userRepository.getUserByEmail(data.email);
            if(emailExists){
                throw new HttpError(409, "Email already exists");
            }
        }
        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUserByEmail(email, data);
        return updatedUser;
    }

  async getCurrentUser(email: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return user;
  }

  async updateProfilePicture(email: string, profilePictureUrl: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const updatedUser = await userRepository.updateUserByEmail(email, { profilePicture: profilePictureUrl });
    return updatedUser;
  }

  async getProfilePicture(email: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return user.profilePicture;
  }
}