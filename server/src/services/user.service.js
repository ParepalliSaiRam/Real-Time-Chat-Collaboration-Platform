import prisma from "../config/prisma.js";

export const searchUsers = async (query, currentUserId) => {
    return prisma.user.findMany({
        where: {
            username: {
                contains: query,
                mode: "insensitive"
            },
            id: {
                not: currentUserId
            }
        },
        select: {
            id: true,
            username: true
        },
        take: 10
    });
};