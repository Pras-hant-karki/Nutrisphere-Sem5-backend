import { Router } from "express";
import { SessionController } from "../controllers/session.controller";
import { adminMiddleware } from "../middelwares/admin.middleware";
import { authorizedMiddelWare } from "../middelwares/authorized.middelware";

const router = Router();

// User-facing route: active sessions only
router.get("/", authorizedMiddelWare, SessionController.getActiveSessions);

// Admin routes
router.get(
  "/admin",
  authorizedMiddelWare,
  adminMiddleware,
  SessionController.getAllSessionsForAdmin
);
router.post(
  "/admin",
  authorizedMiddelWare,
  adminMiddleware,
  SessionController.createSession
);
router.put(
  "/admin/:id",
  authorizedMiddelWare,
  adminMiddleware,
  SessionController.updateSession
);
router.patch(
  "/admin/:id/toggle",
  authorizedMiddelWare,
  adminMiddleware,
  SessionController.toggleSession
);
router.delete(
  "/admin/:id",
  authorizedMiddelWare,
  adminMiddleware,
  SessionController.deleteSession
);

export default router;

