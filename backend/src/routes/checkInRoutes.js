import { Router } from "express";
import { listCheckIns, upsertTodayCheckIn } from "../controllers/checkInController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { attachUser, isEmployee } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", requireAuth, listCheckIns);
router.post("/today", requireAuth, attachUser, isEmployee, upsertTodayCheckIn);

export default router;
