import { markConversationAsRead } from "../services/read.service.js";

export const registerReadHandlers = (io, socket) => {

    socket.on(
        "mark-read",
        async ({ conversationId }) => {

            try {

                const messageIds =
                    await markConversationAsRead(
                        conversationId,
                        socket.user.id
                    );

                if (messageIds.length === 0) {
                    return;
                }

                io.to(`conversation:${conversationId}`)
                    .emit("messages-read", {

                        conversationId,

                        userId: socket.user.id,

                        messageIds

                    });

            } catch (error) {

                socket.emit("error-message", {
                    message: error.message
                });

            }

        }
    );

};