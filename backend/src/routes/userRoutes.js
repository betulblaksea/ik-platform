import { Router } from "express";
import { listUsers } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { attachUser, isManager } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", requireAuth, attachUser, isManager, listUsers);

export default router;
