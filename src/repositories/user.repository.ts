import { UserModel, IUser } from "../models/user.model";

export class UserRepository {
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        return await UserModel.create(userData);
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email });
    }
}
