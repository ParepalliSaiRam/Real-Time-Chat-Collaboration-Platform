import onlineUsers from "./presence.store.js";

export const registerPresenceHandlers = (io, socket) => {

    const userId = socket.user.id;

    // Create a Set for the user if it doesn't exist
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }

    const sockets = onlineUsers.get(userId);

    const wasOffline = sockets.size === 0;

    sockets.add(socket.id);

    if (wasOffline) {
        io.emit("user-online", {
            userId
        });
    }

    socket.on("get-online-users", () => {
        socket.emit(
            "online-users",
            [...onlineUsers.keys()]
        );
    });

    socket.on("disconnect", () => {

        console.log(`Disconnected: ${socket.user.username}`);

        const sockets = onlineUsers.get(userId);

        if (!sockets) return;

        sockets.delete(socket.id);

        if (sockets.size === 0) {

            onlineUsers.delete(userId);

            io.emit("user-offline", {
                userId
            });

        }

    });

};