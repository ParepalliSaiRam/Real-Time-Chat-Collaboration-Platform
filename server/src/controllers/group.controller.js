import asyncHandler from "../utils/asyncHandler.js";
import { createGroupSchema } from "../validations/group.validation.js";
import { renameGroupSchema } from "../validations/group.validation.js";
import { getIO } from "../sockets/index.js";
import {
    createGroup,
    renameGroup,
    addMembers,
    removeMember,
    leaveGroup,
    transferAdmin
} from "../services/group.service.js";

export const createGroupController =
asyncHandler(async (req, res) => {

    const data = createGroupSchema.parse(req.body);

    const group = await createGroup(

        req.user.id,

        data.name,

        data.members

    );

    res.status(201).json({

        success: true,

        message: "Group created successfully.",

        group

    });

});

export const renameGroupController =
asyncHandler(async (req, res) => {

    const data =
        renameGroupSchema.parse(req.body);

    const group =
        await renameGroup(

            req.params.id,

            req.user.id,

            data.name

        );

    getIO()
        .to(`conversation:${req.params.id}`)
        .emit("group-renamed", {

            conversationId: req.params.id,

            name: group.name

        });

    res.json({

        success: true,

        group

    });

});

export const addMembersController =
asyncHandler(async (req, res) => {

    const members =
        await addMembers(

            req.params.id,

            req.user.id,

            req.body.members

        );

    getIO()
        .to(`conversation:${req.params.id}`)
        .emit("member-added", {

            conversationId: req.params.id,

            members

        });

    res.json({

        success: true,

        members

    });

});

export const removeMemberController =
asyncHandler(async (req, res) => {

    const removedUserId =
        await removeMember(

            req.params.id,

            req.user.id,

            req.params.userId

        );

    getIO()
        .to(`conversation:${req.params.id}`)
        .emit("member-removed", {

            conversationId: req.params.id,

            userId: removedUserId

        });

    res.json({

        success: true,

        message: "Member removed successfully.",

        userId: removedUserId

    });

});

export const leaveGroupController =
asyncHandler(async (req, res) => {

    const result =
        await leaveGroup(
            req.params.id,
            req.user.id
        );

    getIO()
        .to(`conversation:${req.params.id}`)
        .emit("member-left", {

            conversationId: req.params.id,

            userId: req.user.id,

            deleted: result.deleted

        });

    res.json({

        success: true,

        ...result

    });

});

export const transferAdminController =
asyncHandler(async (req, res) => {

    const result =
        await transferAdmin(

            req.params.id,

            req.user.id,

            req.body.userId

        );

    getIO()
        .to(`conversation:${req.params.id}`)
        .emit("admin-transferred", result);

    res.json({

        success: true,

        message: "Admin transferred successfully.",

        ...result

    });

});