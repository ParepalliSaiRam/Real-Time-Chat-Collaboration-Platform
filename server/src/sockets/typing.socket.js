export const registerTypingHandlers = (io, socket) => {

    socket.on("typing-start", ({ conversationId }) => {

        socket.to(`conversation:${conversationId}`).emit(
            "typing-start",
            {
                conversationId,
                userId: socket.user.id,
                username: socket.user.username
            }
        );

    });

    socket.on("typing-stop", ({ conversationId }) => {

        socket.to(`conversation:${conversationId}`).emit(
            "typing-stop",
            {
                conversationId,
                userId: socket.user.id
            }
        );

    });

};