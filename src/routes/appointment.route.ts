import { Router } from "express";
import { authorizedMiddelWare } from "../middelwares/authorized.middelware";
import { adminMiddleware } from "../middelwares/admin.middleware";
import { AppointmentController } from "../controllers/appointment.controller";

const router = Router();

/**
 * Appointment Routes
 * Prefix: /api/appointments
 */

// ============ User Routes (require auth) ============

// POST - User books a new appointment
router.post(
    "/",
    authorizedMiddelWare,
    AppointmentController.createAppointment
);

// GET - User gets their own appointments
router.get(
    "/my-appointments",
    authorizedMiddelWare,
    AppointmentController.getMyAppointments
);

// ============ Admin Routes (require auth + admin) ============

// GET - Admin gets all appointments
router.get(
    "/admin",
    authorizedMiddelWare,
    adminMiddleware,
    AppointmentController.getAllAppointments
);

// GET - Admin gets a single appointment by ID
router.get(
    "/admin/:id",
    authorizedMiddelWare,
    adminMiddleware,
    AppointmentController.getAppointmentById
);

// PUT - Admin approves an appointment
router.put(
    "/admin/:id/approve",
    authorizedMiddelWare,
    adminMiddleware,
    AppointmentController.approveAppointment
);

// PUT - Admin reschedules an appointment
router.put(
    "/admin/:id/reschedule",
    authorizedMiddelWare,
    adminMiddleware,
    AppointmentController.rescheduleAppointment
);

// PUT - Admin cancels an appointment
router.put(
    "/admin/:id/cancel",
    authorizedMiddelWare,
    adminMiddleware,
    AppointmentController.cancelAppointment
);

export default router;
