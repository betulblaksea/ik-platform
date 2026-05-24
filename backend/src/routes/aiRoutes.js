import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { attachUser, isManager } from "../middleware/roleMiddleware.js";
import { postInsight, getAiStatus } from "../controllers/aiController.js";
import { getOpenRouterTimeoutMs } from "../services/ai/openrouterClient.js";

const router = Router();

function aiRequestTimeout(req, res, next) {
  const ms = getOpenRouterTimeoutMs() + 15_000;
  req.setTimeout(ms);
  res.setTimeout(ms);
  next();
}

router.use(aiRequestTimeout);
router.get("/status", requireAuth, attachUser, isManager, getAiStatus);
router.post("/insight", requireAuth, attachUser, isManager, postInsight);

export default router;
