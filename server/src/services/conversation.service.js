import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const createConversation = async (currentUserId, otherUserId) => {

    if (currentUserId === otherUserId) {
        throw new AppError("You cannot chat with yourself.", 400);
    }

    const otherUser = await prisma.user.findUnique({
        where: {
            id: otherUserId
        }
    });

    if (!otherUser) {
        throw new AppError("User not found.", 404);
    }

    // Verify friendship
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                {
                    user1Id: currentUserId,
                    user2Id: otherUserId
                },
                {
                    user1Id: otherUserId,
                    user2Id: currentUserId
                }
            ]
        }
    });

    if (!friendship) {
        throw new AppError("You can only chat with friends.", 403);
    }

    // We'll add the conversation lookup and creation next.

    const existingConversation = await prisma.conversation.findFirst({
        where: {
            isGroup: false,

            AND: [
                {
                    participants: {
                        some: {
                            userId: currentUserId
                        }
                    }
                },
                {
                    participants: {
                        some: {
                            userId: otherUserId
                        }
                    }
                }
            ]
        },
        include: {
            participants: true
        }
    });

    return prisma.$transaction(async (tx) => {

        const conversation = await tx.conversation.create({
            data: {
                isGroup: false
            }
        });

        await tx.conversationParticipant.createMany({
            data: [
                {
                    conversationId: conversation.id,
                    userId: currentUserId
                },
                {
                    conversationId: conversation.id,
                    userId: otherUserId
                }
            ]
        });

        return conversation;

    });
};

export const getConversations = async (userId) => {

    const conversations = await prisma.conversation.findMany({

        where: {
            participants: {
                some: {
                    userId
                }
            }
        },

        include: {

            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            },

            messages: {
                orderBy: {
                    createdAt: "desc"
                },
                take: 1,
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            }

        },

        orderBy: {
            lastMessageAt: "desc"
        }

    });

    return conversations.map((conversation) => {

    const otherUser =
        conversation.participants.find(
            p => p.user.id !== userId
        )?.user;

    return {

        id: conversation.id,

        user: otherUser,

        lastMessage:
            conversation.messages[0]?.content ?? "",

        lastMessageAt:
            conversation.messages[0]?.createdAt ?? null

    };

});

};