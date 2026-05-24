import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";
import checkInRoutes from "./checkInRoutes.js";
import aiRoutes from "./aiRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/check-ins", checkInRoutes);
router.use("/ai", aiRoutes);

export default router;
