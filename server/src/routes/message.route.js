import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getMessagesController } from "../controllers/message.controller.js";

router.get(
    "/:conversationId/messages",
    authMiddleware,
    getMessagesController
);