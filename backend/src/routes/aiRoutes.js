import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { attachUser, isManager } from "../middleware/roleMiddleware.js";
import { postInsight } from "../controllers/aiController.js";
import { getGroqTimeoutMs } from "../services/ai/groqClient.js";

const router = Router();

function aiRequestTimeout(req, res, next) {
  const ms = getGroqTimeoutMs() + 15_000;
  req.setTimeout(ms);
  res.setTimeout(ms);
  next();
}

router.use(aiRequestTimeout);
router.post("/insight", requireAuth, attachUser, isManager, postInsight);

export default router;
