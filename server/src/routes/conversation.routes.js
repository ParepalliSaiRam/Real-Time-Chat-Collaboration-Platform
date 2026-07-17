import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { create,getAll } from "../controllers/conversation.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    create
);

router.get(
    "/",
    authMiddleware,
    getAll
);

export default router;