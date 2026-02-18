import { User } from '../../domain/entities/user.entity';
import { UserModel, IUser } from './user.model';

export class UserMapper {
  static toDomain(mongoUser: IUser): User {
    return {
      id: mongoUser._id.toString(),
      fullName: mongoUser.fullName,
      email: mongoUser.email,
      password: mongoUser.password,
      role: mongoUser.role,
      profilePicture: mongoUser.profilePicture,
      image: mongoUser.image,
      phone: mongoUser.phone,
      isActive: mongoUser.isActive,
      lastLogin: mongoUser.lastLogin,
      bio: mongoUser.bio.map(entry => ({
        type: entry.type,
        content: entry.content,
        createdAt: entry.createdAt,
      })),
      createdAt: mongoUser.createdAt,
      updatedAt: mongoUser.updatedAt,
    };
  }

  static toPersistence(domainUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Partial<IUser> {
    return {
      fullName: domainUser.fullName,
      email: domainUser.email,
      password: domainUser.password,
      role: domainUser.role,
      profilePicture: domainUser.profilePicture,
      image: domainUser.image,
      phone: domainUser.phone,
      isActive: domainUser.isActive,
      lastLogin: domainUser.lastLogin,
      bio: domainUser.bio,
    };
  }
}