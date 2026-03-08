import { NextFunction, Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { SessionService } from "../services/session.service";

const sessionService = new SessionService();
const notificationService = new NotificationService();

const getRequestUserId = (user: any): string => {
  const rawId = user?.id ?? user?._id;
  return typeof rawId?.toString === "function" ? rawId.toString() : "";
};

export class SessionController {
  static async getActiveSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await sessionService.getSessions(false);
      return res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllSessionsForAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const sessions = await sessionService.getSessions(true);
      return res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const userId = getRequestUserId(user);
      const created = await sessionService.createSession(userId, req.body);

      try {
        await notificationService.notifyAllUsers(
          "new_session",
          "New Session Available",
          `${user.fullName || "Admin"} has added a new workout session`,
          userId,
          created._id.toString()
        );
      } catch (notifyError) {
        console.error("Failed to send session notification:", notifyError);
      }

      return res.status(201).json({
        success: true,
        message: "Session created successfully",
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const userId = getRequestUserId(user);
      const updated = await sessionService.updateSession(
        req.params.id,
        userId,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Session updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleSession(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const userId = getRequestUserId(user);
      const updated = await sessionService.toggleSession(
        req.params.id,
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Session status updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSession(req: Request, res: Response, next: NextFunction) {
    try {
      await sessionService.deleteSession(req.params.id);
      return res.status(200).json({
        success: true,
        message: "Session deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

