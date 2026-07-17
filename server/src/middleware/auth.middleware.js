import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId
        },
        select: {
            id: true,
            username: true,
            email: true
        }
    });

    if (!user) {
        throw new AppError("Unauthorized", 401);
    }

    req.user = user;

    next();
});

export default authMiddleware;