import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import { uploadAttachmentController } from "../controllers/attachment.controller.js";

const router = Router();

router.post(
    "/:conversationId/attachments",
    authMiddleware,
    uploadSingle,
    uploadAttachmentController
);

export default router;