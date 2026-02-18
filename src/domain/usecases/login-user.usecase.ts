import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  user: User;
  token: string;
}

export class LoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    // Business rule: Find user by email
    const user = await this.userRepository.getUserByEmail(request.email);
    if (!user) {
      throw new Error('User not found');
    }

    // Business rule: Check if user is active
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Note: Password verification should be done in infrastructure layer
    // Here we just return the user, token generation is handled externally

    return {
      user,
      token: '', // Token will be generated in controller/infrastructure
    };
  }
}