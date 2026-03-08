import { Router } from "express";
import { authorizedMiddelWare } from "../middelwares/authorized.middelware";
import { adminMiddleware } from "../middelwares/admin.middleware";
import { uploadSingle } from "../config/multer";
import { AdminController } from "../controllers/admin.controller";

const router = Router();

/**
 * Admin Routes - All require authentication + admin role
 * Prefix: /api/admin
 */

// POST - Create new user (with optional image upload)
router.post(
    "/users",
    authorizedMiddelWare,
    adminMiddleware,
    uploadSingle.single("image"),
    AdminController.createUser
);

// GET - Get all users
router.get(
    "/users",
    authorizedMiddelWare,
    adminMiddleware,
    AdminController.getAllUsers
);

// GET - Get user by ID
router.get(
    "/users/:id",
    authorizedMiddelWare,
    adminMiddleware,
    AdminController.getUserById
);

// PUT - Update user by ID (with optional image upload)
router.put(
    "/users/:id",
    authorizedMiddelWare,
    adminMiddleware,
    uploadSingle.single("image"),
    AdminController.updateUser
);

// DELETE - Delete user by ID
router.delete(
    "/users/:id",
    authorizedMiddelWare,
    adminMiddleware,
    AdminController.deleteUser
);

// ============ Bio Routes ============

// PUT - Save bio entries
router.put(
    "/bio",
    authorizedMiddelWare,
    adminMiddleware,
    AdminController.saveBio
);

// GET - Get bio entries (for admin)
router.get(
    "/bio",
    authorizedMiddelWare,
    adminMiddleware,
    AdminController.getBio
);

// POST - Upload bio image
router.post(
    "/bio/upload-image",
    authorizedMiddelWare,
    adminMiddleware,
    uploadSingle.single("image"),
    AdminController.uploadBioImage
);

// GET - Get trainer info (public for users - only requires auth)
router.get(
    "/trainer-info",
    authorizedMiddelWare,
    AdminController.getTrainerInfo
);

export default router;
