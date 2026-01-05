import { Router } from "express";
import { authorizedMiddelWare } from "../middelwares/authorized.middelware";

const router = Router();

router.get(
  "/profile",
  authorizedMiddelWare,
  (req, res) => {
    return res.json({
      success: true,
      message: "You are authorized",
      user: req.user
    });
  }
);

export default router;
