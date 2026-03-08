import mongoose from "mongoose";
import { HttpError } from "../errors/http-error";
import { DAYS_OF_WEEK, ISession, SessionDay } from "../models/session.model";
import { SessionRepository } from "../repositories/session.repository";

type SessionInput = {
  day: SessionDay;
  sessionName: string;
  timeRange: string;
  location?: string;
  workoutTitle?: string;
  exercises?: string[];
  isActive?: boolean;
};

type SessionRequestInput = Omit<SessionInput, "day"> & {
  day: string;
};

export class SessionService {
  private readonly sessionRepository: SessionRepository;

  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  private normalizeAndValidateInput(data: SessionRequestInput): SessionInput {
    const day = data.day?.trim();
    if (!day || !DAYS_OF_WEEK.includes(day as (typeof DAYS_OF_WEEK)[number])) {
      throw new HttpError(400, "Invalid day value");
    }

    if (!data.sessionName?.trim()) {
      throw new HttpError(400, "Session name is required");
    }

    if (!data.timeRange?.trim()) {
      throw new HttpError(400, "Time range is required");
    }

    return {
      day: day as SessionDay,
      sessionName: data.sessionName.trim(),
      timeRange: data.timeRange.trim(),
      location: (data.location || "").trim(),
      workoutTitle: (data.workoutTitle || "").trim(),
      exercises: (data.exercises || []).map((item) => item.trim()).filter(Boolean),
      isActive: data.isActive ?? true,
    };
  }

  private sortByWeekday(sessions: ISession[]): ISession[] {
    return [...sessions].sort((a, b) => {
      const dayDiff = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  async getSessions(includeInactive: boolean): Promise<ISession[]> {
    const sessions = await this.sessionRepository.getAll(includeInactive);
    return this.sortByWeekday(sessions);
  }

  async createSession(userId: string, data: SessionRequestInput): Promise<ISession> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user ID");
    }

    const payload = this.normalizeAndValidateInput(data);
    return await this.sessionRepository.create({
      ...payload,
      createdBy: new mongoose.Types.ObjectId(userId),
      updatedBy: new mongoose.Types.ObjectId(userId),
    });
  }

  async updateSession(
    sessionId: string,
    userId: string,
    data: SessionRequestInput
  ): Promise<ISession> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new HttpError(400, "Invalid session ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user ID");
    }

    const payload = this.normalizeAndValidateInput(data);
    const updated = await this.sessionRepository.update(sessionId, {
      ...payload,
      updatedBy: new mongoose.Types.ObjectId(userId),
    });

    if (!updated) {
      throw new HttpError(404, "Session not found");
    }

    return updated;
  }

  async toggleSession(sessionId: string, userId: string): Promise<ISession> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new HttpError(400, "Invalid session ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user ID");
    }

    const existing = await this.sessionRepository.getById(sessionId);
    if (!existing) {
      throw new HttpError(404, "Session not found");
    }

    const updated = await this.sessionRepository.update(sessionId, {
      isActive: !existing.isActive,
      updatedBy: new mongoose.Types.ObjectId(userId),
    });

    if (!updated) {
      throw new HttpError(404, "Session not found");
    }

    return updated;
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new HttpError(400, "Invalid session ID");
    }

    const deleted = await this.sessionRepository.delete(sessionId);
    if (!deleted) {
      throw new HttpError(404, "Session not found");
    }
  }
}

