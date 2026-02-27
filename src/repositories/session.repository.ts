import mongoose from "mongoose";
import { ISession, SessionModel } from "../models/session.model";

export class SessionRepository {
  async create(data: Partial<ISession>): Promise<ISession> {
    return await SessionModel.create(data);
  }

  async getAll(includeInactive: boolean): Promise<ISession[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return await SessionModel.find(filter).sort({ createdAt: -1 });
  }

  async getById(id: string | mongoose.Types.ObjectId): Promise<ISession | null> {
    return await SessionModel.findById(id);
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    data: Partial<ISession>
  ): Promise<ISession | null> {
    return await SessionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string | mongoose.Types.ObjectId): Promise<ISession | null> {
    return await SessionModel.findByIdAndDelete(id);
  }
}

