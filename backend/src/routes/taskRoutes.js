import { Router } from "express";
import { createTask, listTasks, updateTask } from "../controllers/taskController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, listTasks);
router.post("/", requireAuth, createTask);
router.patch("/:id", requireAuth, updateTask);

export default router;
