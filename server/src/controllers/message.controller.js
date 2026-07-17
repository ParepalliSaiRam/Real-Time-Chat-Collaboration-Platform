import asyncHandler from "../utils/asyncHandler.js";
import { createConversationSchema } from "../validations/conversation.validation.js";
import { getMessages } from "../services/message.service.js";

export const getMessagesController =
asyncHandler(async (req, res) => {

    const messages =
        await getMessages(
            req.params.conversationId,
            req.user.id
        );

    res.json({

        success: true,

        messages

    });

});