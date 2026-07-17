import asyncHandler from "../utils/asyncHandler.js";
import { createConversationSchema } from "../validations/conversation.validation.js";
import { createConversation } from "../services/conversation.service.js";

export const create = asyncHandler(async (req, res) => {

    const { userId } = createConversationSchema.parse(req.body);

    const conversation = await createConversation(
        req.user.id,
        userId
    );

    res.status(200).json({
        success: true,
        conversation
    });

});

export const getAll = asyncHandler(async (req, res) => {

    const conversations = await getConversations(req.user.id);

    res.json({

        success: true,

        conversations

    });

});