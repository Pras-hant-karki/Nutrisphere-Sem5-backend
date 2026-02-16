import { IAppointment } from "../models/appointment.model";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

export class AppointmentService {
    private appointmentRepository: AppointmentRepository;

    constructor() {
        this.appointmentRepository = new AppointmentRepository();
    }

    /**
     * User books a new appointment
     */
    async createAppointment(
        userId: string,
        data: {
            height: string;
            weight: string;
            job?: string;
            trainingType: string;
            goal: string;
            preferredDate: string;
            preferredTime: string;
            country?: string;
            specialRequest?: string;
        }
    ): Promise<{ appointment: IAppointment; message: string }> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }

        const newAppointment = await this.appointmentRepository.create({
            userId: new mongoose.Types.ObjectId(userId),
            ...data,
        });

        return {
            appointment: newAppointment,
            message: "Appointment booked successfully",
        };
    }

    /**
     * Admin gets all appointments (optionally only pending)
     */
    async getAllAppointments(
        pendingOnly: boolean = false
    ): Promise<IAppointment[]> {
        if (pendingOnly) {
            return await this.appointmentRepository.getAllPending();
        }
        return await this.appointmentRepository.getAll();
    }

    /**
     * Admin gets a single appointment by ID
     */
    async getAppointmentById(appointmentId: string): Promise<IAppointment> {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new HttpError(400, "Invalid appointment ID format");
        }

        const appointment =
            await this.appointmentRepository.getById(appointmentId);
        if (!appointment) {
            throw new HttpError(404, "Appointment not found");
        }

        return appointment;
    }

    /**
     * User gets their own appointments
     */
    async getUserAppointments(userId: string): Promise<IAppointment[]> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID format");
        }

        return await this.appointmentRepository.getByUserId(userId);
    }

    /**
     * Admin approves an appointment
     */
    async approveAppointment(
        appointmentId: string
    ): Promise<{ appointment: IAppointment; message: string }> {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new HttpError(400, "Invalid appointment ID format");
        }

        const existing =
            await this.appointmentRepository.getById(appointmentId);
        if (!existing) {
            throw new HttpError(404, "Appointment not found");
        }

        if (existing.status !== "pending") {
            throw new HttpError(
                400,
                "Only pending appointments can be approved"
            );
        }

        const updated =
            await this.appointmentRepository.approve(appointmentId);

        return {
            appointment: updated!,
            message: "Appointment approved successfully",
        };
    }

    /**
     * Admin reschedules an appointment with a reason, new date & time
     */
    async rescheduleAppointment(
        appointmentId: string,
        message: string,
        newDate: string,
        newTime: string
    ): Promise<{ appointment: IAppointment; message: string }> {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new HttpError(400, "Invalid appointment ID format");
        }

        if (!message || message.trim().length === 0) {
            throw new HttpError(400, "Reschedule reason is required");
        }

        if (!newDate || !newTime) {
            throw new HttpError(
                400,
                "New date and time are required for rescheduling"
            );
        }

        const existing =
            await this.appointmentRepository.getById(appointmentId);
        if (!existing) {
            throw new HttpError(404, "Appointment not found");
        }

        if (existing.status !== "pending") {
            throw new HttpError(
                400,
                "Only pending appointments can be rescheduled"
            );
        }

        const updated = await this.appointmentRepository.reschedule(
            appointmentId,
            message.trim(),
            newDate,
            newTime
        );

        return {
            appointment: updated!,
            message: "Appointment rescheduled successfully",
        };
    }

    /**
     * Admin cancels an appointment with a reason
     */
    async cancelAppointment(
        appointmentId: string,
        reason: string
    ): Promise<{ appointment: IAppointment; message: string }> {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new HttpError(400, "Invalid appointment ID format");
        }

        if (!reason || reason.trim().length === 0) {
            throw new HttpError(400, "Cancellation reason is required");
        }

        const existing =
            await this.appointmentRepository.getById(appointmentId);
        if (!existing) {
            throw new HttpError(404, "Appointment not found");
        }

        if (existing.status !== "pending") {
            throw new HttpError(
                400,
                "Only pending appointments can be cancelled"
            );
        }

        const updated = await this.appointmentRepository.cancel(
            appointmentId,
            reason.trim()
        );

        return {
            appointment: updated!,
            message: "Appointment cancelled",
        };
    }
}
