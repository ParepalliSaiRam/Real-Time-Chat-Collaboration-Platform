import asyncHandler from "../utils/asyncHandler.js";
import {
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage
} from "../services/message.service.js";
import { getIO } from "../sockets/index.js";

export const getMessagesController =
asyncHandler(async (req, res) => {

    const cursor =
        req.query.cursor || null;

    const limit =
        Number(req.query.limit) || 30;

    const result =
        await getMessages(
            req.params.conversationId,
            req.user.id,
            cursor,
            limit
        );

    res.json({

        success: true,

        ...result

    });

});

export const sendMessageController =
asyncHandler(async (req, res) => {

    const message =
        await sendMessage(

            req.params.conversationId,

            req.user.id,

            req.body.content

        );

    getIO()
        .to(`conversation:${req.params.conversationId}`)
        .emit("new-message", message);

    res.status(201).json({

        success: true,

        message

    });

});

export const editMessageController =
asyncHandler(async (req, res) => {

    const message =
        await editMessage(

            req.params.messageId,

            req.user.id,

            req.body.content

        );

    getIO()
        .to(`conversation:${message.conversationId}`)
        .emit("message-edited", message);

    res.json({

        success: true,

        message

    });

});

export const deleteMessageController =
asyncHandler(async (req, res) => {

    const message =
        await deleteMessage(

            req.params.messageId,

            req.user.id

        );

    getIO()
        .to(`conversation:${message.conversationId}`)
        .emit("message-deleted", {

            conversationId: message.conversationId,

            messageId: message.id

        });

    res.json({

        success: true,

        message: "Message deleted successfully."

    });

});