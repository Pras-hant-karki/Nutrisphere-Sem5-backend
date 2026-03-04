import { Router } from "express";
import { UserController } from "../infrastructure/web/auth.controller";
import { authorizedMiddelWare } from "../middelwares/authorized.middelware";
import { uploads } from "../middelwares/upload.middelware";
import { uploadSingle } from "../config/multer";

const router = Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/me", authorizedMiddelWare, UserController.getMe);

// Profile picture routes (protected - for both users and admins)
router.post(
  "/profile-picture",
  authorizedMiddelWare,
  uploads.single("profilePicture"),
  UserController.uploadProfilePicture
);

router.get(
  "/profile-picture",
  authorizedMiddelWare,
  UserController.getProfilePicture
);

// PUT - Update user profile (fullName, phone, image)
router.put(
  "/:id",
  authorizedMiddelWare,
  uploadSingle.single("image"),
  UserController.updateProfile
);

export default router;
