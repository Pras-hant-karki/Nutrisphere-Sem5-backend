import { Router } from "express";
import { authorizedMiddelWare } from "../middelwares/authorized.middelware";
import { adminMiddleware } from "../middelwares/admin.middleware";
import { PlanRequestController } from "../controllers/planRequest.controller";
import { uploadPlanFile } from "../config/multer";

const router = Router();

/**
 * Plan Request Routes
 * Prefix: /api/plan-requests
 */

// ============ User Routes (require auth) ============

// POST - User submits a new plan request
router.post(
    "/",
    authorizedMiddelWare,
    PlanRequestController.createRequest
);

// GET - User gets their own plan requests
router.get(
    "/my-requests",
    authorizedMiddelWare,
    PlanRequestController.getMyRequests
);

// ============ Admin Routes (require auth + admin) ============

// GET - Admin gets all plan requests
router.get(
    "/admin",
    authorizedMiddelWare,
    adminMiddleware,
    PlanRequestController.getAllRequests
);

// GET - Admin gets a single plan request by ID
router.get(
    "/admin/:id",
    authorizedMiddelWare,
    adminMiddleware,
    PlanRequestController.getRequestById
);

// PUT - Admin approves a plan request (file upload or link)
router.put(
    "/admin/:id/approve",
    authorizedMiddelWare,
    adminMiddleware,
    uploadPlanFile.single("planFile"),
    PlanRequestController.approveRequest
);

// PUT - Admin rejects a plan request with reason
router.put(
    "/admin/:id/reject",
    authorizedMiddelWare,
    adminMiddleware,
    PlanRequestController.rejectRequest
);

export default router;
