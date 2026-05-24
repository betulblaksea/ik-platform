import { Router } from "express";
import { listCheckIns, upsertTodayCheckIn } from "../controllers/checkInController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, listCheckIns);
router.post("/today", requireAuth, upsertTodayCheckIn);

export default router;
