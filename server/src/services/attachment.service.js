import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import storage from "../storage/index.js";

export const uploadAttachment = async (
    conversationId,
    senderId,
    file
) => {

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

        const message = await tx.message.create({

            data: {

                conversationId,

                senderId,

                type: file.mimetype.startsWith("image/")
                    ? "IMAGE"
                    : "FILE"

            }

        });

        const uploaded = await storage.upload(file);
        const attachment =
            await tx.attachment.create({

                data: {

                    messageId: message.id,

                    fileName: uploaded.fileName,

                    mimeType: uploaded.mimeType,

                    size: uploaded.size,

                    url: uploaded.url

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

        return {

            ...message,

            attachment

        };

    });

};