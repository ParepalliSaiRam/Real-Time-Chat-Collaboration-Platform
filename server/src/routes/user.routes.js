import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { search } from "../controllers/user.controller.js";

const router = Router();

router.get("/search", authMiddleware, search);

export default router;