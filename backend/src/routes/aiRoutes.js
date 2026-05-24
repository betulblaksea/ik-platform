import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { postInsight, getAiStatus } from "../controllers/aiController.js";
import { getOpenRouterTimeoutMs } from "../services/ai/openrouterClient.js";

const router = Router();

/** OpenRouter ücretsiz model: yanıt 30+ sn sürebilir */
function aiRequestTimeout(req, res, next) {
  const ms = getOpenRouterTimeoutMs() + 15_000;
  req.setTimeout(ms);
  res.setTimeout(ms);
  next();
}

router.use(aiRequestTimeout);
router.get("/status", requireAuth, getAiStatus);
router.post("/insight", requireAuth, postInsight);

export default router;
