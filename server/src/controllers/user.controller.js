import asyncHandler from "../utils/asyncHandler.js";
import { searchUsers } from "../services/user.service.js";

export const search = asyncHandler(async (req, res) => {
    const users = await searchUsers(
        req.query.query || "",
        req.user.id
    );

    res.status(200).json({
        success: true,
        users
    });
});