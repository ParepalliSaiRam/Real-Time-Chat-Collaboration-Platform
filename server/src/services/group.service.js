import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

/**
 * Verify that the conversation exists and is a group.
 */
const getGroup = async (conversationId) => {

    const group = await prisma.conversation.findUnique({
        where: {
            id: conversationId
        }
    });

    if (!group || !group.isGroup) {
        throw new AppError("Group not found.", 404);
    }

    return group;
};

/**
 * Verify that the user is an admin of the group.
 */
const getGroupAdmin = async (conversationId, userId) => {

    await getGroup(conversationId);

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
        throw new AppError("Group not found.", 404);
    }

    if (!participant.isAdmin) {
        throw new AppError(
            "Only group admins can perform this action.",
            403
        );
    }

    return participant;
};

/**
 * Create a new group.
 */
export const createGroup = async (
    creatorId,
    name,
    memberIds
) => {

    const uniqueMembers = [
        ...new Set(
            memberIds.filter(id => id !== creatorId)
        )
    ];

    const users = await prisma.user.findMany({

        where: {

            id: {

                in: uniqueMembers

            }

        },

        select: {

            id: true

        }

    });

    if (users.length !== uniqueMembers.length) {

        throw new AppError(
            "One or more users do not exist.",
            400
        );

    }

    return prisma.$transaction(async (tx) => {

        const conversation =
            await tx.conversation.create({

                data: {

                    isGroup: true,

                    name,

                    createdById: creatorId

                }

            });

        await tx.conversationParticipant.create({

            data: {

                conversationId: conversation.id,

                userId: creatorId,

                isAdmin: true

            }

        });

        if (uniqueMembers.length > 0) {

            await tx.conversationParticipant.createMany({

                data: uniqueMembers.map(userId => ({

                    conversationId: conversation.id,

                    userId,

                    isAdmin: false

                }))

            });

        }

        return tx.conversation.findUnique({

            where: {

                id: conversation.id

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

                }

            }

        });

    });

};

/**
 * Rename an existing group.
 */
export const renameGroup = async (
    conversationId,
    userId,
    name
) => {

    await getGroupAdmin(
        conversationId,
        userId
    );

    return prisma.conversation.update({

        where: {

            id: conversationId

        },

        data: {

            name

        }

    });

};

/**
 * Add new members to a group.
 */
export const addMembers = async (
    conversationId,
    adminId,
    memberIds
) => {

    await getGroupAdmin(
        conversationId,
        adminId
    );

    // Remove duplicates and ignore the admin's own ID
    const uniqueMembers = [
        ...new Set(
            memberIds.filter(
                id => id !== adminId
            )
        )
    ];

    if (!uniqueMembers.length) {
        return [];
    }

    // Verify all supplied users exist
    const users = await prisma.user.findMany({

        where: {

            id: {

                in: uniqueMembers

            }

        },

        select: {

            id: true,

            username: true

        }

    });

    if (users.length !== uniqueMembers.length) {

        throw new AppError(
            "One or more users do not exist.",
            400
        );

    }

    // Find members already present in the group
    const existingMembers =
        await prisma.conversationParticipant.findMany({

            where: {

                conversationId,

                userId: {

                    in: uniqueMembers

                }

            },

            select: {

                userId: true

            }

        });

    const existingIds =
        new Set(
            existingMembers.map(member => member.userId)
        );

    const membersToAdd =
        users.filter(
            user => !existingIds.has(user.id)
        );

    if (!membersToAdd.length) {
        return [];
    }

    await prisma.conversationParticipant.createMany({

        data: membersToAdd.map(user => ({

            conversationId,

            userId: user.id,

            isAdmin: false

        }))

    });

    return membersToAdd;

};

/**
 * Remove a member from a group.
 */
export const removeMember = async (
    conversationId,
    adminId,
    memberId
) => {

    // Verify requester is an admin of a valid group
    await getGroupAdmin(
        conversationId,
        adminId
    );

    // Admin cannot remove themselves
    if (adminId === memberId) {
        throw new AppError(
            "Use the leave group endpoint to leave the group.",
            400
        );
    }

    const participant =
        await prisma.conversationParticipant.findUnique({

            where: {

                conversationId_userId: {

                    conversationId,

                    userId: memberId

                }

            }

        });

    if (!participant) {

        throw new AppError(
            "Member not found in this group.",
            404
        );

    }

    // Prevent removing another admin
    if (participant.isAdmin) {

        throw new AppError(
            "Cannot remove another group admin.",
            403
        );

    }

    await prisma.conversationParticipant.delete({

        where: {

            conversationId_userId: {

                conversationId,

                userId: memberId

            }

        }

    });

    return memberId;

};

export const leaveGroup = async (
    conversationId,
    userId
) => {

    await getGroup(conversationId);

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
            "You are not a member of this group.",
            404
        );
    }

    const memberCount =
        await prisma.conversationParticipant.count({
            where: {
                conversationId
            }
        });

    // Last member → delete group
    if (memberCount === 1) {

        await prisma.conversation.delete({
            where: {
                id: conversationId
            }
        });

        return {
            deleted: true
        };

    }

    // Admin cannot leave while members remain
    if (participant.isAdmin) {

        throw new AppError(
            "Transfer admin rights before leaving the group.",
            400
        );

    }

    await prisma.conversationParticipant.delete({
        where: {
            conversationId_userId: {
                conversationId,
                userId
            }
        }
    });

    return {
        deleted: false
    };

};

export const transferAdmin = async (
    conversationId,
    currentAdminId,
    newAdminId
) => {

    // Verify group exists and requester is admin
    await getGroupAdmin(
        conversationId,
        currentAdminId
    );

    if (currentAdminId === newAdminId) {

        throw new AppError(
            "User is already the group admin.",
            400
        );

    }

    const newAdmin =
        await prisma.conversationParticipant.findUnique({

            where: {

                conversationId_userId: {

                    conversationId,

                    userId: newAdminId

                }

            }

        });

    if (!newAdmin) {

        throw new AppError(
            "Selected user is not a group member.",
            404
        );

    }

    if (newAdmin.isAdmin) {

        throw new AppError(
            "User is already an admin.",
            400
        );

    }

    await prisma.$transaction([

        prisma.conversationParticipant.update({

            where: {

                conversationId_userId: {

                    conversationId,

                    userId: currentAdminId

                }

            },

            data: {

                isAdmin: false

            }

        }),

        prisma.conversationParticipant.update({

            where: {

                conversationId_userId: {

                    conversationId,

                    userId: newAdminId

                }

            },

            data: {

                isAdmin: true

            }

        })

    ]);

    return {

        previousAdminId: currentAdminId,

        newAdminId

    };

};