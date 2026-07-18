import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { transferAdminSchema } from "../validations/group.validation.js";
import {
    createGroupController,
    renameGroupController,
    addMembersController,
    removeMemberController,
    leaveGroupController,
    transferAdminController
} from "../controllers/group.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createGroupController
);

router.patch(
    "/:id",
    authMiddleware,
    renameGroupController
);

router.post(
    "/:id/members",
    authMiddleware,
    addMembersController
);

router.delete(
    "/:id/members/:userId",
    authMiddleware,
    removeMemberController
);

router.post(
    "/:id/leave",
    authMiddleware,
    leaveGroupController
);

router.patch(
    "/:id/admin",
    authMiddleware,
    validate(transferAdminSchema),
    transferAdminController
);

export default router;