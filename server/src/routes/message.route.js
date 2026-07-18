import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
    getMessagesController,
    sendMessageController,
    editMessageController,
    deleteMessageController
} from "../controllers/message.controller.js";

import {
    sendMessageSchema,
    editMessageSchema
} from "../validations/message.validation.js";

const router = Router();

router.get(
    "/:conversationId/messages",
    authMiddleware,
    getMessagesController
);

router.post(
    "/:conversationId/messages",
    authMiddleware,
    validate(sendMessageSchema),
    sendMessageController
);

router.patch(
    "/:messageId",
    authMiddleware,
    validate(editMessageSchema),
    editMessageController
);

router.delete(
    "/:messageId",
    authMiddleware,
    deleteMessageController
);

export default router;