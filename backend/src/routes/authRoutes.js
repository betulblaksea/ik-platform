import { Router } from "express";
import { login, me, register, addEmployee } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { isHR } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/add-employee", requireAuth, isHR, addEmployee);

export default router;
