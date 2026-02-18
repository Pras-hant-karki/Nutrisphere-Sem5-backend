import { Request, Response, NextFunction } from "express";
import { AppointmentService } from "../services/appointment.service";
import { NotificationService } from "../services/notification.service";
import { HttpError } from "../errors/http-error";

const appointmentService = new AppointmentService();
const notificationService = new NotificationService();

export class AppointmentController {
    /**
     * POST /api/appointments
     * User books a new appointment
     */
    static async createAppointment(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = (req.user as any)._id.toString();
            const {
                height,
                weight,
                job,
                trainingType,
                goal,
                preferredDate,
                preferredTime,
                country,
                specialRequest,
            } = req.body;

            if (!height || !weight || !trainingType || !goal || !preferredDate || !preferredTime) {
                throw new HttpError(
                    400,
                    "Missing required fields: height, weight, trainingType, goal, preferredDate, preferredTime"
                );
            }

            const result = await appointmentService.createAppointment(userId, {
                height,
                weight,
                job,
                trainingType,
                goal,
                preferredDate,
                preferredTime,
                country,
                specialRequest,
            });

            // Notify admins about new appointment booking
            try {
                await notificationService.notifyAdmins(
                    "appointment_request",
                    "New Appointment Request",
                    `${(req.user as any).fullName || "A user"} has sent appointment booking request`,
                    (req.user as any)._id.toString(),
                    result.appointment._id?.toString()
                );
            } catch (notifError) {
                console.error("Failed to send notification:", notifError);
            }

            return res.status(201).json({
                success: true,
                message: result.message,
                data: result.appointment,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/appointments/my-appointments
     * User gets their own appointments
     */
    static async getMyAppointments(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = (req.user as any)._id.toString();
            const appointments =
                await appointmentService.getUserAppointments(userId);

            return res.status(200).json({
                success: true,
                data: appointments,
                total: appointments.length,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/appointments/admin
     * Admin gets all appointments
     */
    static async getAllAppointments(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const pendingOnly = req.query.pending === "true";
            const appointments =
                await appointmentService.getAllAppointments(pendingOnly);

            return res.status(200).json({
                success: true,
                data: appointments,
                total: appointments.length,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/appointments/admin/:id
     * Admin gets a single appointment by ID
     */
    static async getAppointmentById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.params;
            const appointment =
                await appointmentService.getAppointmentById(id);

            return res.status(200).json({
                success: true,
                data: appointment,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/appointments/admin/:id/approve
     * Admin approves an appointment
     */
    static async approveAppointment(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.params;
            const result = await appointmentService.approveAppointment(id);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.appointment,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/appointments/admin/:id/reschedule
     * Admin reschedules an appointment with a reason, new date & time
     */
    static async rescheduleAppointment(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.params;
            const { message, newDate, newTime } = req.body;

            if (!message || message.trim().length === 0) {
                throw new HttpError(400, "Reschedule reason is required");
            }

            if (!newDate || !newTime) {
                throw new HttpError(
                    400,
                    "New date and time are required for rescheduling"
                );
            }

            const result = await appointmentService.rescheduleAppointment(
                id,
                message,
                newDate,
                newTime
            );

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.appointment,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/appointments/admin/:id/cancel
     * Admin cancels an appointment with a reason
     */
    static async cancelAppointment(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            if (!reason || reason.trim().length === 0) {
                throw new HttpError(400, "Cancellation reason is required");
            }

            const result = await appointmentService.cancelAppointment(
                id,
                reason
            );

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.appointment,
            });
        } catch (error) {
            next(error);
        }
    }
}
