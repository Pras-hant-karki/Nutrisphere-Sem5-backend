import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserModel } from './user.model';
import { UserMapper } from './user.mapper';

export class MongoUserRepository implements IUserRepository {
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const persistenceUser = UserMapper.toPersistence(user);
    const createdUser = await UserModel.create(persistenceUser);
    return UserMapper.toDomain(createdUser);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).select('+password');
    return user ? UserMapper.toDomain(user) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? UserMapper.toDomain(user) : null;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const persistenceData = UserMapper.toPersistence(userData as any);
    const updatedUser = await UserModel.findByIdAndUpdate(id, persistenceData, { new: true });
    return updatedUser ? UserMapper.toDomain(updatedUser) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map(UserMapper.toDomain);
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email });
    return count > 0;
  }
}