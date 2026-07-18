import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const getMessages = async (
    conversationId,
    userId,
    cursor = null,
    limit = 30
) => {

    // Verify user belongs to conversation
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

    const messages = await prisma.message.findMany({

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
            createdAt: "desc"
        },

        take: limit,

        ...(cursor && {
            cursor: {
                id: cursor
            },
            skip: 1
        })

    });

    const hasMore = messages.length === limit;

    return {

        messages: messages.reverse(),

        nextCursor: hasMore
            ? messages[messages.length - 1].id
            : null,

        hasMore

    };

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

export const editMessage = async (
    messageId,
    userId,
    content
) => {

    const message =
        await prisma.message.findUnique({

            where: {
                id: messageId
            }

        });

    if (!message) {

        throw new AppError(
            "Message not found.",
            404
        );

    }

    if (message.senderId !== userId) {

        throw new AppError(
            "You can only edit your own messages.",
            403
        );

    }

    if (message.isDeleted) {

        throw new AppError(
            "Deleted messages cannot be edited.",
            400
        );

    }

    if (message.type !== "TEXT") {

        throw new AppError(
            "Only text messages can be edited.",
            400
        );

    }

    return prisma.message.update({

        where: {

            id: messageId

        },

        data: {

            content,

            isEdited: true

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

};

export const deleteMessage = async (
    messageId,
    userId
) => {

    const message =
        await prisma.message.findUnique({

            where: {
                id: messageId
            }

        });

    if (!message) {

        throw new AppError(
            "Message not found.",
            404
        );

    }

    if (message.senderId !== userId) {

        throw new AppError(
            "You can only delete your own messages.",
            403
        );

    }

    if (message.isDeleted) {

        throw new AppError(
            "Message is already deleted.",
            400
        );

    }

    return prisma.message.update({

        where: {

            id: messageId

        },

        data: {

            isDeleted: true

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

};