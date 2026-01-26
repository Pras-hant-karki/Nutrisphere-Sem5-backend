import { Router } from "express";
import { FitnessContentController } from "../controllers/fitnessContent.controller";
import { authorizedMiddelWare } from "../middelwares/authorized.middelware";
import { upload } from "../middelwares/upload.middelware";

const router = Router();

/**
 * Public Routes (No authentication required)
 */

// Get all published fitness content
router.get("/", FitnessContentController.getAllContent);

// Get fitness content by specific tag
router.get("/tag/:tag", FitnessContentController.getContentByTag);

// Get fitness content by specific admin
router.get("/admin/:adminId", FitnessContentController.getContentByAdmin);

// Get single fitness content by ID
router.get("/:contentId", FitnessContentController.getContentById);

/**
 * Admin Only Routes
 */

// Create fitness content (Admin only)
router.post(
  "/",
  authorizedMiddelWare,
  upload.single("fitnessPhoto"),
  FitnessContentController.createContent
);  

// Update fitness content (Admin only - owner)
router.put(
    "/:contentId",
    authorizedMiddelWare,
    FitnessContentController.updateContent
);

// Delete fitness content (Admin only - owner)
router.delete(
    "/:contentId",
    authorizedMiddelWare,
    FitnessContentController.deleteContent
);

export default router;
