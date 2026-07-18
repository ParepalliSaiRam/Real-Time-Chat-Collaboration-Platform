import asyncHandler from "../utils/asyncHandler.js";
import { uploadAttachment } from "../services/attachment.service.js";
import { getIO } from "../sockets/index.js";

export const uploadAttachmentController =
asyncHandler(async (req, res) => {

    if (!req.file) {

        return res.status(400).json({

            success: false,

            message: "No file uploaded."

        });

    }

    const message =
        await uploadAttachment(

            req.params.conversationId,

            req.user.id,

            req.file

        );

    getIO()
        .to(`conversation:${req.params.conversationId}`)
        .emit("new-message", message);

    res.status(201).json({

        success: true,

        message

    });

});