import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

export interface RegisterUserRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  user: User;
}

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    // Business rule: Check if email already exists
    const existingUser = await this.userRepository.getUserByEmail(request.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Business rule: Password must be at least 6 characters
    if (request.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Create user entity
    const user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      fullName: request.fullName,
      email: request.email,
      password: request.password, // Note: Password should be hashed in infrastructure layer
      role: 'user',
      isActive: true,
      bio: [],
    };

    const createdUser = await this.userRepository.createUser(user);

    return { user: createdUser };
  }
}