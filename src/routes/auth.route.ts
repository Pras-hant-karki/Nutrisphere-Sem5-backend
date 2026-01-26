import { Router } from "express";
import { UserController } from "../controllers/auth.controller";
import { authorizedMiddelWare } from "../middelwares/authorized.middelware";
import { uploads } from "../middelwares/upload.middelware";

const router = Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);

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

export default router;
