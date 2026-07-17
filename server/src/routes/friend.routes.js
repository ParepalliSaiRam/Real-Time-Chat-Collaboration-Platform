import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    sendRequest,
    getRequests,
    acceptRequest,
    rejectRequest,
    getFriendsList
} from "../controllers/friend.controller.js";

const router = Router();

router.post(
    "/request",
    authMiddleware,
    sendRequest
);

router.get(
    "/requests",
    authMiddleware,
    getRequests
);

router.post(
    "/accept",
    authMiddleware,
    acceptRequest
);

router.post(
    "/reject",
    authMiddleware,
    rejectRequest
);

router.get(
    "/",
    authMiddleware,
    getFriendsList
);

export default router;