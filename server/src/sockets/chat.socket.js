import prisma from "../config/prisma.js";
import { sendMessage } from "../services/message.service.js";

export const registerChatHandlers = (io, socket) => {

    socket.on("join-conversation", async ({ conversationId }) => {

        const participant =
            await prisma.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId: socket.user.id
                    }
                }
            });

        if (!participant) {

            socket.emit("error-message", {
                message: "Unauthorized conversation."
            });

            return;
        }

        socket.join(`conversation:${conversationId}`);

        socket.emit("joined-conversation", {
            conversationId
        });

    });

    socket.on("leave-conversation", ({ conversationId }) => {

        socket.leave(`conversation:${conversationId}`);

    });

    socket.on("send-message", async (data) => {

        try {

            const message = await sendMessage(
                data.conversationId,
                socket.user.id,
                data.content
            );

            io.to(`conversation:${data.conversationId}`)
                .emit("new-message", message);

        } catch (error) {

            socket.emit("error-message", {
                message: error.message
            });

        }

    });

};