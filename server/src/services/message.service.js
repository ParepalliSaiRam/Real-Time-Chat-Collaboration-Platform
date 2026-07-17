import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const getMessages = async (
    conversationId,
    userId
) => {

    const participant =
        await prisma.conversationParticipant.findUnique({

            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            }

        });

    if (!participant) {
        throw new AppError(
            "Conversation not found.",
            404
        );
    }

    return prisma.message.findMany({

        where: {
            conversationId
        },

        include: {

            sender: {
                select: {
                    id: true,
                    username: true
                }
            }

        },

        orderBy: {
            createdAt: "asc"
        }

    });

};

export const sendMessage = async (
    conversationId,
    senderId,
    content
) => {

    // Verify membership
    const participant =
        await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: senderId
                }
            }
        });

    if (!participant) {
        throw new AppError(
            "Conversation not found.",
            404
        );
    }

    return prisma.$transaction(async (tx) => {

        const message =
            await tx.message.create({

                data: {
                    conversationId,
                    senderId,
                    content
                },

                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }

            });

        await tx.conversation.update({

            where: {
                id: conversationId
            },

            data: {
                lastMessageAt: new Date()
            }

        });

        return message;

    });

};