import { AppointmentModel, IAppointment } from "../models/appointment.model";
import mongoose from "mongoose";

export class AppointmentRepository {
    /**
     * Create a new appointment booking
     */
    async create(data: Partial<IAppointment>): Promise<IAppointment> {
        return await AppointmentModel.create(data);
    }

    /**
     * Get all appointments (for admin) with user details populated
     */
    async getAll(): Promise<IAppointment[]> {
        return await AppointmentModel.find()
            .populate("userId", "fullName email phone profilePicture image")
            .sort({ createdAt: -1 });
    }

    /**
     * Get all pending appointments (for admin)
     */
    async getAllPending(): Promise<IAppointment[]> {
        return await AppointmentModel.find({ status: "pending" })
            .populate("userId", "fullName email phone profilePicture image")
            .sort({ createdAt: -1 });
    }

    /**
     * Get appointments by user ID (for user to see their own)
     */
    async getByUserId(
        userId: string | mongoose.Types.ObjectId
    ): Promise<IAppointment[]> {
        return await AppointmentModel.find({ userId }).sort({
            createdAt: -1,
        });
    }

    /**
     * Get a single appointment by ID
     */
    async getById(
        appointmentId: string | mongoose.Types.ObjectId
    ): Promise<IAppointment | null> {
        return await AppointmentModel.findById(appointmentId).populate(
            "userId",
            "fullName email phone profilePicture image"
        );
    }

    /**
     * Admin approves an appointment
     */
    async approve(
        appointmentId: string | mongoose.Types.ObjectId
    ): Promise<IAppointment | null> {
        return await AppointmentModel.findByIdAndUpdate(
            appointmentId,
            {
                status: "approved",
                adminResponse: {
                    message: "Appointment approved",
                    respondedAt: new Date(),
                },
            },
            { new: true }
        );
    }

    /**
     * Admin reschedules an appointment with a reason
     */
    async reschedule(
        appointmentId: string | mongoose.Types.ObjectId,
        message: string,
        newDate: string,
        newTime: string
    ): Promise<IAppointment | null> {
        return await AppointmentModel.findByIdAndUpdate(
            appointmentId,
            {
                status: "rescheduled",
                preferredDate: newDate,
                preferredTime: newTime,
                adminResponse: {
                    message,
                    respondedAt: new Date(),
                },
            },
            { new: true }
        );
    }

    /**
     * Admin cancels an appointment with a reason
     */
    async cancel(
        appointmentId: string | mongoose.Types.ObjectId,
        reason: string
    ): Promise<IAppointment | null> {
        return await AppointmentModel.findByIdAndUpdate(
            appointmentId,
            {
                status: "cancelled",
                adminResponse: {
                    message: reason,
                    respondedAt: new Date(),
                },
            },
            { new: true }
        );
    }

    /**
     * Delete an appointment permanently
     */
    async delete(
        appointmentId: string | mongoose.Types.ObjectId
    ): Promise<IAppointment | null> {
        return await AppointmentModel.findByIdAndDelete(appointmentId);
    }
}
